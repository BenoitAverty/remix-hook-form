# remix-hook-form

Use react-hook-form in your Remix application : powerful client-side validation with the remix development model.

## Motivation

React-hook-form is a popular client-side form validation library. Remix bring an awesome new development model where you use the platform
and the battle-tested technologies of the web : HTML and HTTP. react-hook-form needs a little tuning to fit this development model nicely :
this library is here to help you do that.

## Features

- Powerful client-side validation
- Work with javascript objects when you submit the form instead of HTML form-data
- Seamless server-side / client-side validation without duplicating logic
- Progressive enhancement : your forms work with javascript disabled in the browser
- Better SSR support

> :warning: This library is still in beta. It does not work with complex nested structures yet, and some react-hook-form features may not work. If you find something taht doesn't work for you, please file an issue with your use case.


## How to use

### Install

```bash
npm i -D react-hook-form remix-hook-form @hookform/resolvers
```

### Data type

One of the goals of this library is to facilitate client-side validation while making sure the server performs the same validation.

The best way to do that is by using the schema validation feature of react-hook-form.

For each form you want to create, start by declaring the data schema and the associated data type. Please note that the schema must be an
object.

> :warning: Currently, remix-hook-form only supports zod.

```typescript jsx
// app/routes/users.tsx
import {z} from "zod";

const UserSchema = z.object({
    username: z.string().min(1, "is required"),
    bio: z.optional(z.string()),
    password: z.string().min(8),
})
type User = z.infer<typeof UserSchema>
```

### Making the form

remix-hook-form API is mostly compatible with react-hook-form. The main difference is that `useForm` doesn't return a `handleSubmit`
callback, because it wouldn't work without javascript and makes it hard to do things the remix way. Instead, `useForm` returns a `Form`
component that you can use instead of the Remix `Form` component (it uses remix behind the scenes so everything is the same except for the
client side validation with `react-hook-form`).

Keep in mind that you must use the schema validation feature to have all the advantages of `remix-hook-form`

```typescript jsx
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "remix-hook-form";

const UserSchema = z.object({
    username: z.string().min(1, "is required"),
    bio: z.optional(z.string()),
    password: z.string().min(8),
})
type User = z.infer<typeof UserSchema>

export default function RouteComponent() {

    const {register, Form, formState: {errors, isValid}} = useForm({resolver: zodResolver(UserSchema)});

    return (
        <>
            <p>The below form is {isValid ? "" : <strong>not </strong>} valid.</p>

            <Form method="post">
                <input placeholder="username" {...register("username")}/><br/>
                {errors.username && <p>{errors.username.message}</p>}
                <textarea {...register("bio")} placeholder="bio"/><br/>
                {errors.bio && <p>{errors.bio.message}</p>}
                <input placeholder="password" {...register("password")}/><br/>
                {errors.password && <p>{errors.password.message}</p>}
                <button type="submit">Go !</button>
            </Form>
        </>
    );
}
```

### Handling submission

When the user submits the form, react-hook-form will perform validation. If the form is valid, the request will be handled by the action, which is what we love about remix. If the user has javascript disabled for some reason, the same validation will be performed by the action, and the errors will be present server-side to generate the error messages.

```typescript jsx
import type {ActionFunction} from "remix";
import {json, redirect} from "remix";
import {formErrorsZod, getDataZod, useForm} from "remix-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

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

export default function RouteComponent() {

    const {register, Form, formState: {errors, isValid}} = useForm({resolver: zodResolver(UserSchema)});

    return (
        <>
            <p>The below form is {isValid ? "" : <strong>not </strong>} valid.</p>

            <Form method="post">
                <input placeholder="username" {...register("username")}/><br/>
                {errors.username && <p>{errors.username.message}</p>}
                <textarea {...register("bio")} placeholder="bio"/><br/>
                {errors.bio && <p>{errors.bio.message}</p>}
                <input placeholder="password" {...register("password")}/><br/>
                {errors.password && <p>{errors.password.message}</p>}
                <button type="submit">Go !</button>
            </Form>
        </>
    );
}
```

## Examples

the `test-app` directory contains some examples.
