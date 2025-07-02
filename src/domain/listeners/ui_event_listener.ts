import type { IDiceRollListener } from "./dice_roll_listener";
import type { HtmlLinkListener } from "./html_link_listener";
import type { IImageLoadingListener } from "./image_loading_listener";

export interface IUiEventListener extends HtmlLinkListener, IDiceRollListener, IImageLoadingListener {
}
