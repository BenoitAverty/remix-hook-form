import {z, ZodError, ZodType} from "zod";

export async function getDataZod<I, T extends ZodType<I>>(schema: T, request: Request): Promise<z.infer<typeof schema>> {
    const formData = await request.formData();
    const data: any = {}
    for (let key of formData.keys()) {
        data[key] = formData.get(key)
    }
    
    return schema.parseAsync(data)
}

export function formErrorsZod(e: ZodError) {
    return { 
        __formErrors: e.issues
    }
}