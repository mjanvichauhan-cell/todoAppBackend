import e from "express";
import { collectionName, connection } from "./dbconfig.js";
import cors from 'cors';
import { ObjectId } from "mongodb";
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser";
const app = e();

const PORT = 3200;

app.use(e.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser());

app.post("/login", async (req, resp) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = db.collection('users');
        const result = await collection.findOne({
            email: userData.email,
            password: userData.password
        });
        if (result) {
            jwt.sign(
                { email: result.email },
                'Google',
                { expiresIn: '5d' },
                (error, token) => {
                    if (error) {
                        return resp.status(500).send({
                            success: false,
                            msg: 'Token generation failed'
                        });
                    }
                    resp.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        maxAge: 5 * 24 * 60 * 60 * 1000
                    });
                    resp.send({
                        success: true,
                        msg: 'login done',
                        token
                    });
                }
            );
        } else {
            resp.send({
                success: false,
                msg: 'User not found'
            });
        }
    } else {
        resp.send({
            success: false,
            msg: 'login not done'
        });
    }
});

app.post("/signup", async (req, resp) => {
    const userData = req.body;
    try {
        if (userData.email && userData.password) {
            const db = await connection();
            const collection = db.collection('users');
            const existingUser = await collection.findOne({
                email: userData.email.trim().toLowerCase()
            });
            if (existingUser) {
                return resp.status(409).send({
                    success: false,
                    msg: 'User already exists. Please login.'
                });
            }
            const result = await collection.insertOne({
                ...userData,
                email: userData.email.trim().toLowerCase()
            });
            jwt.sign(
                { email: userData.email.trim().toLowerCase() },
                'Google',
                { expiresIn: '5d' },
                (error, token) => {
                    if (error) {
                        return resp.status(500).send({
                            success: false,
                            msg: 'Token generation failed'
                        });
                    }
                    resp.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'lax',
                        maxAge: 5 * 24 * 60 * 60 * 1000
                    });
                    resp.status(201).send({
                        success: true,
                        msg: 'Signup done',
                        result,
                        token
                    });
                }
            );
        } else {
            return resp.status(400).send({
                success: false,
                msg: 'Email and password are required'
            });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            success: false,
            msg: 'Signup failed'
        });
    }
});

app.post("/add-task", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const result = await collection.insertOne({
            ...req.body,
            userEmail: req.user.email
        });
        if (result.acknowledged) {
            resp.send({
                message: 'new task added',
                success: true,
                result
            });
        } else {
            resp.send({
                message: 'task not added',
                success: false
            });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            message: 'Something went wrong',
            success: false
        });
    }
});

app.get("/tasks", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const result = await collection.find({
            userEmail: req.user.email
        }).toArray();
        resp.send({
            message: 'task list fetched',
            success: true,
            result
        });
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            message: 'error try after sometime',
            success: false
        });
    }
});

app.get("/task/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return resp.status(400).send({
                success: false,
                message: 'Invalid task ID'
            });
        }
        const result = await collection.findOne({
            _id: new ObjectId(id),
            userEmail: req.user.email
        });
        if (result) {
            resp.send({
                message: 'task fetched',
                success: true,
                result
            });
        } else {
            resp.status(404).send({
                message: 'Task not found',
                success: false
            });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            message: 'error try after sometime',
            success: false
        });
    }
});

app.put("/update-task", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const { _id, userEmail, ...fields } = req.body;
        if (!ObjectId.isValid(_id)) {
            return resp.status(400).send({
                success: false,
                message: "Invalid task ID"
            });
        }
        const result = await collection.updateOne(
            {
                _id: new ObjectId(_id),
                userEmail: req.user.email
            },
            {
                $set: fields
            }
        );
        if (result.matchedCount === 0) {
            return resp.status(404).send({
                success: false,
                message: "Task not found"
            });
        }
        resp.send({
            success: true,
            message: "Task data updated",
            result
        });
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            success: false,
            message: "Error updating task"
        });
    }
});

app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return resp.status(400).send({
                success: false,
                message: "Invalid task ID"
            });
        }
        const result = await collection.deleteOne({
            _id: new ObjectId(id),
            userEmail: req.user.email
        });
        if (result.deletedCount === 0) {
            return resp.status(404).send({
                success: false,
                message: "Task not found"
            });
        }
        resp.send({
            success: true,
            message: "Task deleted",
            result
        });
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            success: false,
            message: "Error deleting task"
        });
    }
});

app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const Ids = req.body;
        if (!Array.isArray(Ids) || Ids.length === 0 ||
            !Ids.every(id => ObjectId.isValid(id))) {
            return resp.status(400).send({
                success: false,
                message: "Please provide valid task IDs"
            });
        }
        const deleteTaskIds = Ids.map(id => new ObjectId(id));
        const result = await collection.deleteMany({
            _id: { $in: deleteTaskIds },
            userEmail: req.user.email
        });
        resp.send({
            success: true,
            message: "Tasks deleted",
            result
        });
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            success: false,
            message: "Error deleting tasks"
        });
    }
});

app.post("/logout", (req, resp) => {
    resp.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    resp.send({
        success: true,
        message: "Logout successful"
    });
});

app.get("/profile", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection('users');
        const result = await collection.findOne(
            { email: req.user.email },
            { projection: { password: 0 } }
        );
        if (result) {
            resp.send({
                success: true,
                message: "Profile fetched",
                result
            });
        } else {
            resp.status(404).send({
                success: false,
                message: "User not found"
            });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).send({
            success: false,
            message: "Something went wrong"
        });
    }
});

function verifyJWTToken(req, resp, next) {
    const token = req.cookies?.token;
    if (!token) {
        return resp.status(401).send({
            success: false,
            msg: "Token missing. Please login first."
        });
    }
    jwt.verify(token, 'Google', (error, decoded) => {
        if (error) {
            return resp.status(401).send({
                success: false,
                msg: "Invalid or expired token"
            });
        }
        req.user = decoded;
        next();
    });
}

const startServer = async () => {
    try {
        await connection();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
    }
};

startServer();