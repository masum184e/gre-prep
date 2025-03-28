import databaseConnection from "@/config/databaseConnection";
import UserModel from "@/models/userSchema";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const helper = (req) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded;
    } catch (error) {
        console.log("JWT verification error:", error.message);
        return NextResponse.json({ status: false, message: "Invalid token or signature" }, { status: 401 });
    }
};


export const GET = async (req, res) => {
    try {
        const { userId } = helper(req);

        await databaseConnection(process.env.DATABASE_URL, process.env.DATABASE_NAME);
        const user = await UserModel.findById(userId).select("-password -__v -createdAt -updatedAt");

        if (!user) {
            return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ status: true, user }, { status: 200 });
    } catch (error) {
        console.log("Error in user profile", error.message);
        return NextResponse.json({ status: false, message: "Internal Server Error" }, { status: 500 });
    }
}