<script lang="ts">
    import IoMdCloudUpload from "svelte-icons/io/IoMdCloudUpload.svelte";
    import { listen } from "@tauri-apps/api/event";
    import { readTextFile } from '@tauri-apps/api/fs';
    import {GetPowershellParametersPriv} from './../fsHelpers/getParameters'

    listen("tauri://file-drop", async (event) => {
        // payload of dropped file is path for file
        var filePath = event?.payload[0];

        const parameters = await GetPowershellParametersPriv(filePath);
        console.log(parameters);
    });

    let files = {
        accepted: [],
        rejected: [],
    };

    let drop_zone;

    function handleDragDrop(e) {
        console.log("Dropping!");
    }

    function handleDragStart(e) {
        console.log("Dragging start");
    }

    function handleDragEnd(e) {
        console.log("Dragging end");
    }
</script>

<div
    bind:this={drop_zone}
    on:drop={(event) => handleDragDrop(event)}
    id="drop_zone"
>
    <IoMdCloudUpload />
</div>
