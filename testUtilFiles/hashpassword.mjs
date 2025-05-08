import bcrypt from "bcryptjs";

async function hashPassword(password) {
  try {
    const saltRounds = 12; // Matches your code
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Hashed password:", hash);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
  }
}

hashPassword("password");
