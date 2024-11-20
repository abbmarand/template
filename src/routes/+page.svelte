<script>
    import { SignIn, SignOut } from "@auth/sveltekit/components";
    import { page } from "$app/stores";
</script>

<h1>SvelteKit Auth Example</h1>
<div>
    {#if $page.data.user}
        {#if $page.data.user?.image}
            <img src={$page.data.user.image} class="avatar" alt="User Avatar" />
        {/if}
        <span class="signedInText">
            <small>Signed in as</small><br />
            <strong>{$page.data.user?.name ?? "User"}</strong>
        </span>
        <SignOut>
            <div slot="submitButton" class="buttonPrimary">Sign out</div>
        </SignOut>
    {:else}
        <SignIn provider="google" />
    {/if}
</div>
