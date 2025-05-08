function wrapAsync(fn){
    return async function(req,res,next){
        fn(req,res,next).catch(next);
    }
}

module.exports = wrapAsync;