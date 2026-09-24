<script lang="ts">
	import { BadgePlus, BadgeX, BicepsFlexed, ChevronRight, ChevronsDown, CircleAlert, Coins, Copy, EditSquare, Eye, EyeDashed, Filters, Globe, HandFist, Heart, Hourglasses, One, Plus, Route, Scale, Search, Shield, ShieldAlert, ShieldCheck, ShieldHalf, ShieldMinus, ShieldX, Skull, SquareDimensions, Sword, Trash, UserCog, Weight, Wrench } from "../index";
</script>

<div class="gallery">
	<div class="icon"><Coins size={32} /><span>Coins</span></div>
	<div class="icon"><Weight size={32} /><span>Weight</span></div>
	<div class="icon"><Shield size={32} /><span>Shield</span></div>
	<div class="icon"><ShieldMinus size={32} /><span>ShieldMinus</span></div>
	<div class="icon"><ShieldCheck size={32} /><span>ShieldCheck</span></div>
	<div class="icon"><ChevronsDown size={32} /><span>ChevronsDown</span></div>
	<div class="icon"><HandFist size={32} /><span>HandFist</span></div>
	<div class="icon"><UserCog size={32} /><span>UserCog</span></div>
	<div class="icon"><Wrench size={32} /><span>Wrench</span></div>
	<div class="icon"><BicepsFlexed size={32} /><span>BicepsFlexed</span></div>
	<div class="icon"><CircleAlert size={32} /><span>CircleAlert</span></div>
	<div class="icon"><Route size={32} /><span>Route</span></div>
	<div class="icon"><Sword size={32} /><span>Sword</span></div>
	<div class="icon"><Hourglasses size={32} /><span>Hourglasses</span></div>
	<div class="icon"><SquareDimensions size={32} /><span>SquareDimensions</span></div>
	<div class="icon"><EyeDashed size={32} /><span>EyeDashed</span></div>
	<div class="icon"><ChevronRight size={32} /><span>ChevronRight</span></div>
	<div class="icon"><Heart size={32} /><span>Heart</span></div>
	<div class="icon"><One size={32} /><span>One</span></div>
	<div class="icon"><Scale size={32} /><span>Scale</span></div>
	<div class="icon"><ShieldHalf size={32} /><span>ShieldHalf</span></div>
	<div class="icon"><ShieldX size={32} /><span>ShieldX</span></div>
	<div class="icon"><BadgeX size={32} /><span>BadgeX</span></div>
	<div class="icon"><Eye size={32} /><span>Eye</span></div>
	<div class="icon"><Globe size={32} /><span>Globe</span></div>
	<div class="icon"><Skull size={32} /><span>Skull</span></div>
	<div class="icon"><BadgePlus size={32} /><span>BadgePlus</span></div>
	<div class="icon"><ShieldAlert size={32} /><span>ShieldAlert</span></div>
	<div class="icon"><Plus size={32} /><span>Plus</span></div>
	<div class="icon"><EditSquare size={32} /><span>EditSquare</span></div>
	<div class="icon"><Trash size={32} /><span>Trash</span></div>
	<div class="icon"><Filters size={32} /><span>Filters</span></div>
	<div class="icon"><Copy size={32} /><span>Copy</span></div>
	<div class="icon"><Search size={32} /><span>Search</span></div>
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 16px;
		padding: 16px;
	}

	.icon {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 16px 8px;
		border: 1px solid var(--sb-color-border, #d9d9d9);
		border-radius: 8px;
	}

	span {
		font-family: sans-serif;
		font-size: 12px;
		text-align: center;
	}
</style>
