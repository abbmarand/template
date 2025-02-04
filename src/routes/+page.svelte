<script>
    import { SignIn, SignOut } from "@auth/sveltekit/components";
    import { onMount } from "svelte";
    import { socket } from "$lib/websocket/client.svelte";
    import { v4 as uuidv4 } from "uuid";
    let { data } = $props();
    let message = $state("");

    let responses = $state([]);

    onMount(() => {
        socket.on("message", (message) => {
            responses.push(message);
        });
    });

    async function sendMessage() {
        const response = await fetch("/message", {
            method: "POST",
            body: JSON.stringify({ message: uuidv4() }),
        });
        if (response.ok) {
            const data = await response.json();
            responses.push(data);
            message = "";
        }
    }
</script>

<h1>SvelteKit Auth Example</h1>
<div>
    {#if data.user}
        {#if data.user?.image}
            <img src={data.user.image} class="avatar" alt="User Avatar" />
        {/if}
        <span class="signedInText">
            <small>Signed in as</small><br />
            <strong>{data.user?.name ?? "User"}</strong>
        </span>
        <SignOut>
            <div slot="submitButton" class="buttonPrimary">Sign out</div>
        </SignOut>
    {:else}
        <SignIn provider="google" />
    {/if}

    <div>
        <input type="text" bind:value={message} />
        <button onclick={sendMessage}>Send</button>
    </div>

    <ul>
        {#each responses as response}
            <li>{response.message}</li>
        {/each}
    </ul>
</div>
