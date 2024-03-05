import jwt from "jsonwebtoken";

function tokenDecode(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
        } catch (err) {
            console.error(err);
        }
    }
    next()
}

export default tokenDecode;