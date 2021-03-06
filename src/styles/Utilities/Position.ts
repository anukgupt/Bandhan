export const enum Location {
    start = "start",
    center = "center",
    end = "end"
}

export interface IOrigin {
    horizontal: Location;
    vertical: Location;
}

export interface IOffset {
    horizontal: number;
    vertical: number;
}

export interface IPoint {
    x: number;
    y: number;
}

/**
 * Calculates the distance between two points
 * @param pointA First point
 * @param pointB Second point
 */
export function distance(pointA: IPoint, pointB: IPoint): number {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
}

/**
 * The position method is used to set the location of an absolutely positioned element
 * using the standard positioning properties. The names of these properties conform to
 * the naming patterns used in the Material Popover https://material-ui.com. They
 * are not exact but follow the same pattern.
 *
 * For an example usage, look at the Callout component and how it uses this method to
 * position the element in the page.
 *
 * @param transformElement The element that is being positioned/transformed.
 * @param transformOrigin The origin within the transformed element to align with the
 *  anchor position.
 * @param anchorOffset Offset on the anchorElement that is applied to the computed location
 *  given the element/origin/point.
 * @param anchorElement The element used to anchor the position of the transformed element.
 *  The caller must supply either an anchorElement and anchorOrigin, or anchorPoint.
 * @param anchorOrigin When an anchorElement is supplied the anchorOrigin defines the location
 *  on the anchorElement used for positioning.
 * @param anchorPoint Instead of an anchorElement the caller can use an explicit point
 *  to be used as the basis for the anchorLocation. The anchorOffset will still be applied.
 */
export function position(
    transformElement: HTMLElement,
    transformOrigin: IOrigin,
    anchorOffset?: IOffset,
    anchorElement?: HTMLElement,
    anchorOrigin?: IOrigin,
    anchorPoint?: IPoint
) {
    // Translate the anchor location information to a point on the anchor element
    // if a specific point was not supplied.
    if (!anchorPoint) {
        if (anchorElement && anchorOrigin) {
            anchorPoint = pointFromOrigin(anchorOrigin, anchorElement.getBoundingClientRect());
        } else {
            return;
        }
    }

    let xPosition = anchorPoint.x;
    let yPosition = anchorPoint.y;

    let translateXFactor = 0;
    let translateYFactor = 0;

    // Update the anchorPoint by the anchorOffset if one was supplied.
    if (anchorOffset) {
        xPosition += anchorOffset.horizontal;
        yPosition += anchorOffset.vertical;
    }

    // Special case Start/Start since we dont need the parent rect.
    if (transformOrigin.horizontal !== Location.start || transformOrigin.vertical !== Location.start) {
        const windowHeight = document.documentElement.clientHeight;
        const windowWidth = document.documentElement.clientWidth;

        // Compute the effective horizontal position of the element.
        switch (transformOrigin.horizontal) {
            case Location.end:
                xPosition = windowWidth - xPosition;
                break;

            case Location.center:
                translateXFactor = -50;
                break;

            default:
        }

        // Compute the effective vertical position of the element.
        switch (transformOrigin.vertical) {
            case Location.end:
                yPosition = windowHeight - yPosition;
                break;

            case Location.center:
                translateYFactor = -50;
                break;

            default:
        }
    }

    // Update the transform elements position (it needs to be absolutely positioned in the window).
    // Void out other styles in case this is a re-call
    if (transformOrigin.horizontal !== Location.end) {
        transformElement.style.left = xPosition + 5000 + "px";
        transformElement.style.right = "";
    } else {
        transformElement.style.left = "";
        transformElement.style.right = xPosition + 5000 + "px";
    }

    if (transformOrigin.vertical !== Location.end) {
        transformElement.style.top = yPosition + 5000 + "px";
        transformElement.style.bottom = "";
    } else {
        transformElement.style.top = "";
        transformElement.style.bottom = yPosition + 5000 + "px";
    }

    // Apply centering as necessary
    if (translateXFactor !== 0 || translateYFactor !== 0) {
        transformElement.style.transform = `translate(${translateXFactor}%, ${translateYFactor}%)`;
    } else {
        transformElement.style.transform = "";
    }
}

/**
 * updateLayout is used to move an element to the "best" location based on it
 * layout. This will look at all the positioning attributes and move the
 * transformElement to a new location based on its size. This is usually done
 * after an initial call to position. After the element is positioned the
 * caller determines if the transformElement is in the desired location, which
 * generally translates to, is it clipped in the window.
 *
 * This is delayed because when position is called the transformElement is
 * frequently not fully laid out and we need to wait other a force reflow will
 * happen and cause performance issues.
 *
 * @param transformElement The element that is being positioned/transformed.
 * @param transformOrigin The origin within the transformed element to align with the
 *  anchor position.
 * @param anchorOffset Offset on the anchorElement that is applied to the computed location
 *  given the element/origin/point.
 * @param anchorElement The element used to anchor the position of the transformed element.
 *  The caller must supply either an anchorElement and anchorOrigin, or anchorPoint.
 * @param anchorOrigin When an anchorElement is supplie the anchorOrigin defines the location
 *  on the anchorElement used for positioning.
 * @param anchorPoint Instead of an anchorElement the caller can use an explicit point
 *  to be used as the basis for the anchorLocation. The anchorOffset will still be applied.
 */
export function updateLayout(
    transformElement: HTMLElement,
    transformOrigin: IOrigin,
    anchorOffset?: IOffset,
    anchorElement?: HTMLElement,
    anchorOrigin?: IOrigin,
    anchorPoint?: IPoint
) {
    const windowHeight = document.documentElement.clientHeight;
    const windowWidth = document.documentElement.clientWidth;

    // Get the current layout for the transformElement to determine the best layout.
    let transformElementRect = transformElement.getBoundingClientRect();

    // Determine which edges of the transform element are clipped by the window.
    let clippedBottom = Math.floor(transformElementRect.bottom) > windowHeight;
    let clippedRight = Math.floor(transformElementRect.right) > windowWidth;
    let clippedLeft = Math.floor(transformElementRect.left) < 0;
    let clippedTop = Math.floor(transformElementRect.top) < 0;

    // If any of the edges are clipped we will update the layout to a better layout if available.
    if (clippedBottom || clippedRight || clippedLeft || clippedTop) {
        // If we are positioned based on a point and and offset we will flip over
        // the clipped edge.
        if (anchorPoint) {
            // Flip vertically top/bottom depending on the clipping edges.
            if (clippedTop !== clippedBottom) {
                if (clippedTop) {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.bottom < windowHeight / 2 - 10) {
                        if (transformOrigin.vertical === Location.end) {
                            transformOrigin.vertical = Location.start;
                        }
                    }
                } else {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.top > windowHeight / 2 + 10) {
                        if (transformOrigin.vertical === Location.start) {
                            transformOrigin.vertical = Location.end;
                        }
                    }
                }

                if (anchorOffset) {
                    anchorOffset.vertical = -anchorOffset.vertical;
                }
            }

            // Flip hoizontally left/right depending on the clipping edges.
            if (clippedLeft !== clippedRight) {
                if (clippedLeft) {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.right < windowWidth / 2 - 10) {
                        if (transformOrigin.horizontal === Location.end) {
                            transformOrigin.horizontal = Location.start;
                        }
                    }
                } else {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.left > windowWidth / 2 + 10) {
                        if (transformOrigin.horizontal === Location.start) {
                            transformOrigin.horizontal = Location.end;
                        }
                    }
                }

                if (anchorOffset) {
                    anchorOffset.horizontal = -anchorOffset.horizontal;
                }
            }
        }

        // If the element is positioned based on an anchorElement/anchorOrigin
        // we need to look determine if the element can slide along any axis.
        else if (anchorOrigin && anchorElement) {
            // Flip vertically top/bottom depending on the clipping edges.
            if (clippedTop !== clippedBottom) {
                if (clippedTop) {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.bottom < windowHeight / 2 - 10) {
                        if (transformOrigin.vertical === Location.end && anchorOrigin.vertical === Location.start) {
                            transformOrigin.vertical = Location.start;
                            anchorOrigin.vertical = Location.end;
                        } else if (
                            transformOrigin.vertical === Location.center ||
                            (transformOrigin.vertical === Location.end && anchorOrigin.vertical === Location.end)
                        ) {
                            transformOrigin.vertical = Location.start;
                            anchorOrigin.vertical = Location.start;
                        }
                    }
                } else {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.top > windowHeight / 2 + 10) {
                        if (transformOrigin.vertical === Location.start && anchorOrigin.vertical === Location.end) {
                            transformOrigin.vertical = Location.end;
                            anchorOrigin.vertical = Location.start;
                        } else if (
                            transformOrigin.vertical === Location.center ||
                            (transformOrigin.vertical === Location.start && anchorOrigin.vertical === Location.start)
                        ) {
                            transformOrigin.vertical = Location.end;
                            anchorOrigin.vertical = Location.end;
                        }
                    }
                }

                if (anchorOffset) {
                    anchorOffset.vertical = -anchorOffset.vertical;
                }
            }

            if (clippedLeft !== clippedRight) {
                // Flip hoizontally left/right depending on the clipping edges.
                if (clippedLeft) {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.right < windowWidth / 2 - 10) {
                        if (transformOrigin.horizontal === Location.end && anchorOrigin.horizontal === Location.start) {
                            transformOrigin.horizontal = Location.start;
                            anchorOrigin.horizontal = Location.end;
                        } else if (
                            transformOrigin.horizontal === Location.center ||
                            (transformOrigin.horizontal === Location.end && anchorOrigin.horizontal === Location.end)
                        ) {
                            transformOrigin.horizontal = Location.start;
                            anchorOrigin.horizontal = Location.start;
                        }
                    }
                } else {
                    // Before we flip lets make sure we have at least 10 more pixels the other direction.
                    if (transformElementRect.left > windowWidth / 2 + 10) {
                        if (transformOrigin.horizontal === Location.start && anchorOrigin.horizontal === Location.end) {
                            transformOrigin.horizontal = Location.end;
                            anchorOrigin.horizontal = Location.start;
                        } else if (
                            transformOrigin.horizontal === Location.center ||
                            (transformOrigin.horizontal === Location.start && anchorOrigin.horizontal === Location.start)
                        ) {
                            transformOrigin.horizontal = Location.end;
                            anchorOrigin.horizontal = Location.end;
                        }
                    }
                }

                if (anchorOffset) {
                    anchorOffset.horizontal = -anchorOffset.horizontal;
                }
            }
        }

        // Update the position based on the changes made to the location details.
        position(transformElement, transformOrigin, anchorOffset, anchorElement, anchorOrigin, anchorPoint);

        // If the repositioned element doesnt fit, we will put max-height/max-width to
        // force the entire element into the viewport.
        transformElementRect = transformElement.getBoundingClientRect();

        // Determine which edges of the transform element are clipped by the window.
        clippedBottom = Math.floor(transformElementRect.bottom) > windowHeight;
        clippedRight = Math.floor(transformElementRect.right) > windowWidth;
        clippedLeft = Math.floor(transformElementRect.left) < 0;
        clippedTop = Math.floor(transformElementRect.top) < 0;

        // Since we are clipped compute the updated sizes and position a second time.
        if (clippedTop || clippedBottom || clippedLeft || clippedRight) {
            if (clippedTop || clippedBottom) {
                const maxHeight =
                    transformElementRect.height -
                    (clippedTop ? -transformElementRect.top : 0) -
                    (clippedBottom ? transformElementRect.bottom - windowHeight : 0) -
                    5;
                transformElement.style.maxHeight = maxHeight + "px";
            }

            if (clippedLeft || clippedRight) {
                const maxWidth =
                    transformElementRect.width -
                    (clippedLeft ? -transformElementRect.left : 0) -
                    (clippedRight ? transformElementRect.right - windowWidth : 0) -
                    5;

                transformElement.style.maxWidth = maxWidth + "px";
            }

            // Note the change to the component with the overflow className.
            transformElement.classList.add("overflow");

            // Update its position one final time.
            position(transformElement, transformOrigin, anchorOffset, anchorElement, anchorOrigin, anchorPoint);
        }
    }
}

function pointFromOrigin(location: IOrigin, rect: ClientRect): IPoint {
    let x: number;
    let y: number;

    // Compute the horizontal position based on the rectangle.
    switch (location.horizontal) {
        case Location.start:
            x = rect.left;
            break;

        case Location.end:
            x = rect.right;
            break;

        default:
            x = rect.left + rect.width / 2;
    }

    // Compute the vertical position based on the rectangle.
    switch (location.vertical) {
        case Location.start:
            y = rect.top;
            break;

        case Location.end:
            y = rect.bottom;
            break;

        default:
            y = rect.top + rect.height / 2;
    }

    return { x, y };
}
