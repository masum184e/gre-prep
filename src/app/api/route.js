import UserModel from "@/models/userSchema";

export const GET = async (req, res) => {
    try {

        const userId = req.user.userId;

        const user = await UserModel.findById(userId).select("-password -__v -createdAt -updatedAt");
        if (!user) {
            return new Response(JSON.stringify({ status: false, message: "User not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ status: true, user }), { status: 200 });
    } catch (error) {
        console.log("Error in user profile", error.message);
        return new Response(JSON.stringify({ status: false, message: "Internal Server Error" }), { status: 500 });
    }
}