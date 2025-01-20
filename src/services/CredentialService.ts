import bcrypt from "bcrypt";

export class CredentialService {
    async passwordCompare(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
