export default function(req, res, next) {
    const token = req.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (token.client === "Admin") {
        return next();
    }

    if (token.client === "User") {
        const { userID } = token;
        const { image } = req.params;
        if (image === `${userID}.webp` || image === `${userID}new.webp`) {
            return next();
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
}