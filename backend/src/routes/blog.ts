import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "@bashergoingcrazy/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL : string;
        JWT_SECRET : string;
    }
    Variables: {
        userId: string,
    }
}>();

// Middleware to check if the user is authenticated
blogRouter.use("/*", async (c,next) => {
    try {
        const authHeader = c.req.header("authorization") || "";
        const user = await verify(authHeader, c.env.JWT_SECRET);

        if (user) {
            c.set("userId", user.id.toString());
            await next();
        }
        else {
            c.status(402);
            return c.json({
                message: "Unauthorized"
            })
        }
    }
    catch(e) {
        console.log(e);
        c.status(411);
        c.text("authentication failed");
    }
    
})

// Creating a Blog post route
blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);

    if(!success) {
        c.status(411);
        return c.text("Wrong inputs given");
    }

    const authorId = c.get("userId");

    try {
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId) 
            }
        })

        return c.json({
            id: blog.id
        })
    }
    catch(e){
        console.log(e);
        c.status(411);
        return c.text('Blog already exists');
    }
})


// Updating a blog post route
blogRouter.put('/', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body);

    if (!success) {
        c.status(411);
        return c.text("Inputs are incorrect");
    }

    try {
        const blog = await prisma.blog.update({
            where : {
                id : body.id
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })

        return c.json({
            id: blog.id
        })
    }
    catch(e) {
        console.log(e);
        c.status(411);
        return c.text('Blog not found');
    }
})

// Fetching a blog post route
blogRouter.get('get/:id', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id = c.req.param("id");

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id:Number(id) 
            }
        });

        return c.json({blog});
    }
    catch(e) {
        console.log(e);
        c.status(411);
        return c.text('Blog not found');
    }
})

// add Pagination will do it later when exploring frontend
// Fetching all blog posts route
blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blogs = await prisma.blog.findMany();

    return c.json(blogs);
})
