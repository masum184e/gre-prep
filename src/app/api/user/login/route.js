import UserModel from "@/models/userSchema"

export const POST = async (req, res) => {
    try {
        const { email, password } = await req.json()

        const existingUser = await UserModel.findOne({ email })
        if (!existingUser) {
            return new Response(JSON.stringify({ status: false, message: "User not found" }), { status: 400 })
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordMatch) {
            return new Response(JSON.stringify({ status: false, message: "Invalid password" }), { status: 400 })
        }

        const token = await jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.TOKEN_EXPIRES });
        return new Response(JSON.stringify({ status: true, message: "User registered successfully", token }), { status: 200 })

    } catch (error) {
        console.log("Error in user login", error.message)
        return new Response(JSON.stringify({ status: false, message: "User login failed" }), { status: 500 })
    }
}