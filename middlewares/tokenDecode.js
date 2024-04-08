import jwt from "jsonwebtoken";

export default function (req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.token = decoded;
        } catch (err) {
            console.error(err);
        }
    }
    next()
}
