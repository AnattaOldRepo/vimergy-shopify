<template>
  <div class="c-secondLoaderIcon__contain">
    <div class="c-secondLoaderIcon">
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@design';
.c-secondLoaderIcon__contain{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  margin-top: 20px;
}

.c-secondLoaderIcon{
  position: relative;
  &:before{
    content: '';
    animation: rotate 1s ease-in-out infinite;
    animation-play-state: inherit;
    position: absolute;
    width: 60px;
    height: 60px;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
    border: 5px solid #B1B1B1;
    border-radius: 50%;
    border-bottom-color: $color-blue-brand;
  }
}

@keyframes rotate {
  0% {
		transform: translate3d(-50%, -50%, 0) rotateZ(0deg);
	}
	100% {
		transform: translate3d(-50%, -50%, 0) rotateZ(360deg);
	}
}

@-webkit-keyframes rotate {
	0% {
		-webkit-transform: rotateZ(0deg);
	}
	100% {
		-webkit-transform: rotateZ(360deg);
	}
}
</style>
