import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)       // ✅ use variables, not strings
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    // Create account and auto-login
    async createAccount({ email, name, password }) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name); // ✅ fixed
            if (userAccount) {
                return this.login({ email, password }); // ✅ object form
            }
            return userAccount;
        } catch (error) {
            throw error;
        }
    }

    // Login
    async login({ email, password }) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    // Get logged-in user
    async getUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite service :: getUser :: error", error);
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            return await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite service :: logout :: error", error);
            throw error;
        }
    }
}

// Singleton instance
const authService = new AuthService();
export default authService;
