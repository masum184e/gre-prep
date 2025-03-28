import databaseConnection from "@/config/databaseConnection";
import UserModel from "@/models/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import * as yup from "yup";

const registrationSchema = yup.object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    passportNumber: yup.string().required("Passport number is required"),
    password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required"),
    dateOfBirth: yup.date().required("Date of birth is required").typeError("Invalid date format"),
});

export const POST = async (req, res) => {
    try {
        const body = await req.json();

        await databaseConnection(process.env.DATABASE_URL, process.env.DATABASE_NAME);
        await registrationSchema.validate(body, { abortEarly: false });

        const { firstName, lastName, email, passportNumber, password, dateOfBirth } = body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ status: false, message: "User already exists" }, { status: 400 });
        }

        const bcryptSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_GEN_SALT_NUMBER, 10));
        const hashPassword = await bcrypt.hash(password, bcryptSalt);

        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            passportNumber,
            password: hashPassword,
            createdAt: new Date(),
        });

        const savedUser = await newUser.save();
        if (!savedUser) {
            return NextResponse.json({ status: false, message: "User registration failed" }, { status: 500 });
        }

        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.TOKEN_EXPIRES || "1h" }
        );

        return NextResponse.json({ status: true, message: "User registered successfully", token }, { status: 201 });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return NextResponse.json({ status: false, message: "Validation error", errors: error.errors }, { status: 400 });
        }

        console.error("Error in user registration:", error.message);
        return NextResponse.json({ status: false, message: "User registration failed" }, { status: 500 });
    }
};