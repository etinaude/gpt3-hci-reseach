<script>
	export let bannerInfo = {
		style: '',
		text: '',
		display: false
	};
</script>

{#if bannerInfo.display}
	<div class="banner {bannerInfo.style}">{bannerInfo.text}</div>
{/if}

<style>
	.banner {
		padding: 1rem;
		border-radius: 10px;
		text-align: center;
		font-weight: bold;

		position: fixed;
		top: 10px;
		left: 50%;
		transform: translate(-50%, 0);
		width: 90%;
	}

	.success {
		background-color: #00ff95;
	}

	.error {
		background-color: #ff2a4e;
	}

	.loading {
		background-color: #2af1ff;
	}
</style>
