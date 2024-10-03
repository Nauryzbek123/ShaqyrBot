import users from "../../db/user";

export async function saveUser(user: { username: string; telegramAddress: string; kaspiNumber: number,chatId: number,session: string }) {
    const newUser = new users(user);
    await newUser.save();
  }

export async function getUserByTgId(username: string) {
    try {
      const user = await users.findOne({ telegramAddress: username }).exec();
     console.log(`user in func getUserbytg ${user}`);
      
      if (user) {
        return user;
      } else {
        console.log(`User with telegramAddress ${username} not found.`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user by telegramAddress: ${error}`);
      throw error;
    }
  }

  export async function getAllRegisteredUsers() {
    try {
      const user = await users.find();
      
      if (user) {
        return user;
      } else {
        console.log(`User with telegramAddress  not found.`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user by telegramAddress: ${error}`);
      throw error;
    }
  }