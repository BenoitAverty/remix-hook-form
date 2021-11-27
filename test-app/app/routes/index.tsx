import type {ActionFunction, MetaFunction} from "remix";
import {json, redirect} from "remix";
import {formErrorsZod, getDataZod, useForm} from "remix-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";


// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
    return {
        title: "Remix Starter",
        description: "Welcome to remix!"
    };
};

const UserSchema = z.object({
    username: z.string().min(1, "is required"),
    bio: z.optional(z.string()),
    password: z.string().min(8),
})
type User = z.infer<typeof UserSchema>

export let action: ActionFunction = async function action({request}) {
    try {
        const data: User = await getDataZod(UserSchema, request)
        return redirect(`/success?data=${JSON.stringify(data)}`)
    } catch (e: any) {
        return json(formErrorsZod(e))
    }

}

// https://remix.run/guides/routing#index-routes
export default function Index() {

    const {register, Form, formState: {errors, isValid}} = useForm({resolver: zodResolver(UserSchema) });

    return (
        <div className="remix__page">
            <main>
                <h1>Complex forms with remix !</h1>
                
                <p>The above form is {isValid ? "" : <strong>not </strong>} valid.</p>

                <Form method="post">
                    <input placeholder="username" {...register("username")}/><br/>
                    {errors.username && <p>{errors.username.message}</p>}
                    <textarea {...register("bio")} placeholder="bio"/><br/>
                    {errors.bio && <p>{errors.bio.message}</p>}
                    <input placeholder="password" {...register("password")}/><br/>
                    {errors.password && <p>{errors.password.message}</p>}
                    <button type="submit">Go !</button>
                </Form>
            </main>
        </div>
    );
}
