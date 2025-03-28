import UserModel from "@/models/userSchema"

export const POST = async (req, res) => {
    try {
        const { email, password } = await req.json()
        const user = {
            firstName,
            lastName,
            email,
            passportNumber,
            password
        }

        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return new Response(JSON.stringify({ status: false, message: "User already exists" }), { status: 400 })
        }

        const bcryptSalt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_GEN_SALT_NUMBER));
        const hashPassword = await bcrypt.hash(password, bcryptSalt);

        const userData = new UserModel({
            firstName,
            lastName,
            email,
            passportNumber,
            password: hashPassword,
            createdAt: new Date(),
        })
        const savedUser = await userData.save();
        if (!savedUser) {
            return new Response(JSON.stringify({ status: false, message: "User registration failed" }), { status: 500 })
        }

        const token = await jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRES });
        return new Response(JSON.stringify({ status: true, message: "User registered successfully", token }), { status: 200 })
    } catch (error) {
        console.log("Error in user registration", error.message)
        return new Response(JSON.stringify({ status: false, message: "User registration failed" }), { status: 500 })
    }
}