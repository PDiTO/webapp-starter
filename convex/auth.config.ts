// convex/auth.config.ts - Declares the native Convex Auth provider metadata.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
