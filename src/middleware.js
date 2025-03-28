import jwt from "jsonwebtoken";

export const middleware = async (req, res) => {
    try {

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ status: false, message: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return new Response(JSON.stringify({ status: false, message: "Unauthorized" }), { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        console.log("Error in middleware", error.message);
        return new Response(JSON.stringify({ status: false, message: "Unauthorized" }), { status: 401 });
    }
}

export const middlewareOptions = {
    matcher: "/api/users/",
}