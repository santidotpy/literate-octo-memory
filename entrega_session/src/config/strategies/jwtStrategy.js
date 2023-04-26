import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { managerUser } from '../../controllers/auth.controller.js';



const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PRIVATE_KEY_JWT
}

export const strategyJWT = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await managerUser.getElementById(payload.user.id)

        if (!user) {
            return done(null, false)
        }

        return done(null, user)

    } catch (error) {
        return done(error, false)
    }
})
