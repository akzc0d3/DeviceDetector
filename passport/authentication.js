const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStratergy = require('passport-local').Strategy;
const { UserProvider } = require('../db');
const { ObjectId } = require('mongodb');
 
passport.use(new LocalStratergy((username, password, done) => {
    
    UserProvider.get({username:{$regex: new RegExp(`^${username}$`,'i')} }).then((admin)=>{
        
        if(!admin) return done(null, false,{message:'Invalid username'});
        bcrypt.compare(password,admin.hash,(error,result)=>{
            if(error) return done(error);

            if(!result) return done(null, false,{message:'Invalid password'});

            return done(null,admin);
        })
    }).catch(error=> done(error));
    
}))

passport.serializeUser((admin, done)=>{
    
    done(null,admin._id);
});

passport.deserializeUser((id,done)=>{

    id = new ObjectId(id);
    UserProvider.get({'_id':id}).then((admin)=>{
        done(null,admin)
    }).catch(error => done(error));
})

module.exports = passport;