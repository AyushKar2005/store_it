"use server"
import {createAdminClient, createSessionClient,} from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import {cookies} from "next/headers";
import {redirect} from "next/navigation"

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.error("🔥 ERROR:", message, error);
    throw new Error(message);
};

export const sendEmailOtp = async ({ email }: { email: string }) => {
    try {
        // ❗ Use session client to access auth-based account actions
        const { account } = await createAdminClient();

        const token = await account.createEmailToken(ID.unique(), email);
        return token.userId;
    } catch (error) {
        handleError(error, "❌ Failed to send email OTP");
    }
};

export const createAccount = async ({
                                        fullName,
                                        email,
                                    }: {
    fullName: string;
    email: string;
}) => {
    try {
        const existingUser = await getUserByEmail(email);

        const accountId = await sendEmailOtp({ email });
        if (!accountId) throw new Error("❌ Failed to send OTP or create session");

        if (!existingUser) {
            const { databases } = await createAdminClient();

            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                ID.unique(),
                {
                    fullName,
                    email,
                    avatar: "/avatar.png",
                    accountId,
                }
            );
        }

        return parseStringify({ accountId });
    } catch (error) {
        console.error("❌ createAccount failed:", {
            error,
            message: error instanceof Error ? error.message : String(error),
        });
        throw new Error("Account creation failed.");
    }
};

export const verifySecret = async ({
    accountId,password,
}:{
    accountId: string;
    password: string;
})=>{
    try {
        const {account} = await createAdminClient();

        const session = await account.createSession(accountId, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });

        return parseStringify({sessionId:session.$id})

    }catch(error){
        handleError(error,"Failed to verify OTP");
    }
}

export const getCurrentUser = async()=>{
    try{

    const {databases,account} = await createSessionClient();

    const result = await account.get();
    const user = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId",result.$id)],
    )
    if(user.total<=0) return null;

    return parseStringify(user.documents[0])
    }catch(error){
        console.log(error);
    }
}

export const signOutUser = async()=>{

    const{account } = await createSessionClient();
    try{
        await account.deleteSession("current");
        (await cookies()).delete("appwrite-session")

    }catch(error){
        handleError(error,"Failed to sign out user");
    }finally {
        redirect("/sign-in")
    }
}

export const signInUser = async({email}:{email:string})=>{
    try{
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            await sendEmailOtp({ email });
            return parseStringify({accountId:existingUser.accountId})
        }
        return parseStringify({accountId:null,error:"User not found"})
    }catch(error){
        handleError(error,"Failed to sign in User");
    }
}