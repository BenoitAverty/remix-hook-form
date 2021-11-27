import type {FieldValues, UseFormProps, UseFormReturn as rhfUseFormReturn} from "react-hook-form";
import {useForm as rhfUseForm} from "react-hook-form";
import {Form as RemixForm, useActionData, useSubmit} from "@remix-run/react"
import React from "react";
import {SubmitHandler} from "react-hook-form/dist/types/form";
import {ZodIssue} from "zod";

export type RemixFormComponent = typeof RemixForm;

export type UseFormReturn<
    TFieldValues extends FieldValues = FieldValues,
    TContext extends object = object
> = Omit<rhfUseFormReturn<TFieldValues, TContext>, "handleSubmit"> & { Form: RemixFormComponent }

export function useForm<
    TFieldValues extends FieldValues = FieldValues,
    TContext extends object = object
>(props?: UseFormProps<TFieldValues, TContext>): UseFormReturn<TFieldValues, TContext> {
    // Get the errors from the action
    const actionData = useActionData()
    
    
    // UseForm
    const { handleSubmit, formState, ...useFormReturn } = rhfUseForm(props);
    const submit = useSubmit();
    const doSubmit: SubmitHandler<TFieldValues> = (data, event) => {
        if(event) {
            submit(event.target);
        }
    }

    const Form: RemixFormComponent = React.forwardRef(function (props, forwardedRef) {
        return (<RemixForm ref={forwardedRef} onSubmit={handleSubmit(doSubmit)} {...props}>{props.children}</RemixForm>);
    })

    const errorsProxy = new Proxy<any>(formState.errors, {
        get(obj, prop) {
            const trueError = obj[prop];
            if (!trueError && actionData && actionData.__formErrors) {
                let fieldError = actionData.__formErrors.find((e: ZodIssue) => e.path[0] === prop);
                if (fieldError) {
                    return {type: fieldError.code, message: fieldError.message}
                }
            }
            return trueError;
        }
    })
    
    const formStateProxy = new Proxy<any>(formState, {
        get(obj, prop) {
            return prop === "errors" ? errorsProxy : obj[prop];
        }
    })
    
    
    return {
        ...useFormReturn,
        formState: formStateProxy,
        Form
    };
}