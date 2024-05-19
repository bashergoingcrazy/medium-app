import { z } from "zod";

export const signupInput = z.object({
    username: z.string().min(3).email(),
    password: z.string().min(8),
    name: z.string().min(3).optional(),
})
export const signinInput = z.object({
    username: z.string().min(3).email(),
    password: z.string().min(8),
})
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string().min(6),
})
export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string().min(6),
    id:z.number(),
})

// type inferencing in zod
export type SignupInput = z.infer<typeof signupInput>;


// type inferencing in zod
export type SigninInput = z.infer<typeof signinInput>;


export type CreateBlogInput = z.infer<typeof createBlogInput>;


export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
