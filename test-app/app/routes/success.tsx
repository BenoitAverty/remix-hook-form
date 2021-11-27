import {useSearchParams} from "@remix-run/react";

export default function FormSuccess() {

    let data = useSearchParams()[0].get("data") ?? "{}";
    return (<><p>Looks like everything went well. You submitted :</p>
        <pre>{JSON.stringify(JSON.parse(data), null, 2)}</pre>
    </>)
}