import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl) // ✅ use env variables
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }

  // Create account and auto-login
  async createAccount({ email, name, password }) {
    try {
      const userAccount = await this.account.create(ID.unique(), email, password, name);

      // Auto-login after account creation
      if (userAccount) {
        await this.login({ email, password });
        // Fetch the full user object
        const currentUser = await this.getCurrentUser();
        return currentUser;
      }

      return userAccount;
    } catch (error) {
      console.error("AuthService :: createAccount error", error);
      throw error;
    }
  }

  // Login
  async login({ email, password }) {
    try {
      await this.account.createEmailPasswordSession(email, password);
      const currentUser = await this.getCurrentUser();
      return currentUser; // returns the logged-in user
    } catch (error) {
      console.error("AuthService :: login error", error);
      throw error;
    }
  }

  // Get logged-in user, returns null for guests
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      // 401 indicates guest user
      if (error?.code === 401) {
        console.log("AuthService :: getCurrentUser :: guest user");
      } else {
        console.error("AuthService :: getCurrentUser error", error);
      }
      return null;
    }
  }

  // Logout
  async logout() {
    try {
      await this.account.deleteSessions();
      return true;
    } catch (error) {
      console.error("AuthService :: logout error", error);
      return false;
    }
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;
