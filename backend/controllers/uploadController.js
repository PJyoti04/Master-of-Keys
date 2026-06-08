// import express from "express";
// import imagekit from "../config/imagekit.js";

// const router = express.Router();

// router.get("/auth", (req, res) => {
//   const authParams = imagekit.helper.getAuthenticationParameters();

//   res.status(200).json(authParams);
// });

// export default router;

import imagekit from "../config/imageKit.js";

const getAuthParamsForUpload = (req,res) => {
    const authParams = imagekit.helper.getAuthenticationParameters();

    res.status(200).json(authParams);
}

export {
    getAuthParamsForUpload,
}