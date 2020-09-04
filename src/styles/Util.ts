import * as React from "react";
import { IPoint } from "./Utilities/Position";

/**
 * Set of KeyCodes that are used in the platform.
 */
export enum KeyCode {
    backspace = 8,
    tab = 9,
    enter = 13,
    shift = 16,
    ctrl = 17,
    alt = 18,
    pause = 19,
    capsLock = 20,
    escape = 27,
    space = 32,
    pageUp = 33,
    pageDown = 34,
    end = 35,
    home = 36,
    leftArrow = 37,
    upArrow = 38,
    rightArrow = 39,
    downArrow = 40,
    delete = 46,
    b = 66,
    i = 73,
    k = 75,
    t = 84,
    windowsKey = 91, // (Windows)
    macCommand = 91, // (MAC)
    F10 = 121,
    numLock = 144,
    scrollLock = 145,
    comma = 188
}

/**
 * Determines whether or not a keystroke is an arrow key or not.
 */
export function isArrowKey(event: React.KeyboardEvent<HTMLElement>): boolean {
    return (
        event.which === KeyCode.downArrow ||
        event.which === KeyCode.upArrow ||
        event.which === KeyCode.leftArrow ||
        event.which === KeyCode.rightArrow
    );
}

/**
 * Type guard function to determine if children are defined as a function
 * @param children (usually from this.props.children)
 */
export function isFunctionalChildren<T>(children: React.ReactNode): children is (props: T) => JSX.Element {
    return typeof children === "function";
}

/**
 * childCount is used to determine the number of defined renderable children within
 * a standard set of React.Children. This is different than React.Children.length
 * which includes children that are null or undefined.
//  */
// export function childCount(children?: React.ReactNode): number {
//     let childCount = 0;
//     React.Children.forEach(children, function (child: React.ReactChild) {
//         if (child) {
//             childCount++;
//         }
//     });
//     return childCount;
// }

/**
 * getSafeId is designed to create a string from the input id that is safe for use
 * as the id attribute of a component. The ids appear in the global javscript namespace.
 * This means if you create an element and assign the "id" property to a value
 * the element is accessible by doing window.<id>. This causes problems when the
 * id of the element collides with other global objects. Using a SafeId adds a prefix
 * intended to avoid conflicts.
 *
 * This should be called anytime a DOM elements property is being set that refers to
 * the components id. This should not be called when passing the id as a prop to a
 * component. It is the components responsibility to make the Id safe when attaching
 * it to an element.
 *
 * This includes but is not limited to properties like:
 *  aria-controls, aria-describedby, aria-labelledby, id, htmlFor, ...
 *
 * @param id The root id that is being made "Safe".
 */
export function getSafeId(id?: string): string | undefined {
    // if ($DEBUG) {
    //     if (id && id.startsWith("__bolt-")) {
    //         console.error(`getSafeId was called twice on id ${id}, it should only be called once`);
    //     }
    // }

    // querySelector won't select id's with .'s in them replace them with '-'.
    return id ? "__bolt-" + id.replace(/[^0-9A-Za-z_]/g, "-") : undefined;
}

/**
 * getSafeIdSelector will return the string that can use used to denote the selector
 * for elements that use this id.
 *
 * @param id The root id that is being made "Safe".
 */
export function getSafeIdSelector(id: string): string {
    return "#" + getSafeId(id);
}

/**
 * function that does nothing and accepts any set of arguments.
 */
export function noop() {}

/**
 * Basic function for building a css classlist string from and array of classes, where
 * one of more of the arguments may be null or undefined.
 *
 * @param classes Array of strings the represents the css class list.
 *
 * @example css("base", "active", x === 42 && "optional") will return "base active optional" if x === 42 or "base active" otherwise
 */
export function css(...classes: Array<string | undefined | null | false>): string {
    return classes
        .filter(c => c)
        .join(" ")
        .trim();
}

/**
 * Returns the set of parent elements with index 0 the root and the last
 * element is either the direct parent or itself based on includeSelf.
 *
 * @param element The element to get the parent element hierarchy from.
 * @param includeSelf Should the element supplied be included in the parent list.
 * @param rootElement Optional root element to stop processing
 * @param includeRoot Should the root element supplied be included in the parent list.
 */
export function getParents(element: HTMLElement, includeSelf?: boolean, rootElement?: HTMLElement, includeRoot?: boolean): HTMLElement[] {
    const parentElements: HTMLElement[] = [];

    if (includeSelf) {
        parentElements.push(element);
    }

    while (element.parentElement && element.parentElement !== rootElement) {
        parentElements.splice(0, 0, element.parentElement);
        element = element.parentElement;
    }

    if (element.parentElement && includeRoot) {
        parentElements.splice(0, 0, element.parentElement);
    }

    return parentElements;
}

/**
 * Determines if the target element of an event (or its ancestry) has a particular node name.
 *
 * @param event The initial element is pulled off of this event.
 * @param nodeNames A list of DOM node names ("A", "INPUT", etc.) to check for the presence
 * @param rootAncestor If provided, build a list of ancestors from the event's element, to this element to check. Otherwise,
 * only check the element from the event.
 */
export function eventTargetContainsNode(
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    nodeNames: string[],
    rootAncestor?: HTMLElement
) {
    const targetElement = event.target as HTMLElement;
    const ancestors = rootAncestor ? getParents(targetElement, true, rootAncestor, true) : [targetElement];
    return ancestors.some(element => nodeNames.indexOf(element.nodeName) !== -1);
}

/**
 * ElementRelationship is used to define how two elements in the same
 * document are related in position to each other.
 */
export enum ElementRelationship {
    Unrelated = 0,
    Before = 1,
    After = 2,
    Child = 3,
    Parent = 4
}

/**
 * getRelationship returns the relationship of the two specified elements.
 *
 * @param element1
 * @param element2
 */
export function getRelationship(element1: HTMLElement, element2: HTMLElement): ElementRelationship {
    // If the second element is a child of the first element, then element1 occurs before element2.
    if (element1.contains(element2)) {
        return ElementRelationship.Parent;
    }

    // If the first element is a child of the second element, then element1 occurs after element2.
    if (element2.contains(element1)) {
        return ElementRelationship.Child;
    }

    // Retrieve the parents of both the elements.
    const parents1 = getParents(element1, true);
    const parents2 = getParents(element2, true);

    for (let elementIndex = 0; ; elementIndex++) {
        if (parents1[elementIndex] !== parents2[elementIndex]) {
            const siblings = parents1[elementIndex - 1].children;
            for (let siblingIndex = 0; siblingIndex < siblings.length; siblingIndex++) {
                if (siblings[siblingIndex] === parents1[elementIndex]) {
                    return ElementRelationship.Before;
                }
                if (siblings[siblingIndex] === parents2[elementIndex]) {
                    return ElementRelationship.After;
                }
            }
        }
    }
}

/**
 * preventDefault is used as a standard delegate to prevent the default behavior
 * for a given event.
 *
 * @param event Synthetic event that should have its default action prevented.
 */
export function preventDefault(event: React.SyntheticEvent<HTMLElement>) {
    event.preventDefault();
}

/**
 * shimRef is used to acquire a React Ref from a child component. If the child
 * has an existing ref, it will return the existing ref, if not it will
 * create a new one.
 */
export function shimRef<T>(child: React.ReactChild): React.RefObject<T> {
    // @HACK: This uses an internal property on the created element which is the
    //  forwarded ref property of the element. If React ever changes the implementation
    //  removing this property this code will need to be updated.
    // @NOTE: The ref MUST be a React.createRef if the a ref property is specified,
    //  otherwise we will not be able to share the ref.
    let ref: React.RefObject<T> = (child as any).ref;

    // If no ref was created by the element owner we will add one.
    if (!ref) {
        ref = React.createRef<T>();
    } else {
        // @DEBUG: Ensure the ref is a React.createRef by validated the current property
        if (!ref.hasOwnProperty("current")) {
            throw Error("Children of a focus zone MUST use React.createRef to obtain child references");
        }
        // @DEBUG
    }

    return ref;
}

let focusVisible = false;

/**
 * Determine whether or not focus is currently visible to the user. This generally
 * means the user is using the keyboard to manage focus instead of the mouse.
 */
export function getFocusVisible(): boolean {
    return focusVisible;
}

/**
 * Make sure the focus treatment is enabled and disabled based on
 * the state of mouse and keyboard usage.
 */
export function setFocusVisible(visible: boolean) {
    if ((focusVisible = visible) === true) {
        document.body && document.body.classList.add("bolt-focus-visible");
    } else {
        document.body && document.body.classList.remove("bolt-focus-visible");
    }
}

/* Setup the set of non-focus keys, when these are pressed it doesnt start showing focus treatment */
const nonFocusKeys: boolean[] = new Array(255);
nonFocusKeys[KeyCode.alt] = true;
nonFocusKeys[KeyCode.capsLock] = true;
nonFocusKeys[KeyCode.ctrl] = true;
nonFocusKeys[KeyCode.numLock] = true;
nonFocusKeys[KeyCode.pause] = true;
nonFocusKeys[KeyCode.scrollLock] = true;
nonFocusKeys[KeyCode.shift] = true;
nonFocusKeys[KeyCode.windowsKey] = true;

document.addEventListener(
    "keydown",
    (event: KeyboardEvent) => {
        if (!nonFocusKeys[event.which]) {
            setFocusVisible(true);
        }
    },
    true
);

interface IMouseCapture {
    button: number;
    callback: (event: MouseEvent) => void;
}

let mouseCapture: IMouseCapture | undefined;

// MouseCaptureFunction is the global mouse handler we use to trap events and forward
// them to the current capture if one exists.
const mouseCaptureFunction = (event: MouseEvent) => {
    // Track the position of the mouse as it moves.
    Mouse.position.x = event.clientX;
    Mouse.position.y = event.clientY;

    // Notify the mouse capture of the mouse movement and mouseup if one is signed up.
    if (mouseCapture && mouseCapture.callback && mouseCapture.button === event.button) {
        mouseCapture.callback(event);

        if (event.type === "mouseup") {
            Mouse.releaseCapture(mouseCapture.callback);
        }
    }
};

export const Mouse = {
    position: {
        x: 0,
        y: 0
    },

    releaseCapture: function releaseCapture(callback: (event: MouseEvent) => void) {
        if (mouseCapture && mouseCapture.callback === callback) {
            mouseCapture = undefined;
        }
    },

    setCapture: function setCapture(callback: (event: MouseEvent) => void, button: number = 0) {
        // Before starting a new capture, we will release the current capture.
        if (mouseCapture) {
            Mouse.releaseCapture(mouseCapture.callback);
        }

        // Update the mouseCapture to the new capture.
        mouseCapture = { button, callback };
    }
};

document.addEventListener("mousemove", mouseCaptureFunction);
document.addEventListener("mouseup", mouseCaptureFunction);
document.addEventListener(
    "mousedown",
    event => {
        // Screen readers on scan mode trigger some key strokes as Mouse events.
        // We can easily identify those events because they have no coordinates.
        if (
            event.button === 0 &&
            event.clientX === 0 &&
            event.clientY === 0 &&
            event.screenX === 0 &&
            event.screenY === 0 &&
            event.pageX === 0 &&
            event.pageY === 0
        ) {
            return;
        }

        setFocusVisible(false);
    },
    true
);

interface ITouchCapture {
    callback: (event: TouchEvent) => void;
}

let touchCapture: ITouchCapture | undefined;

// touchCaptureFunction is the global touch handler we use to trap events and forward
// them to the current capture if one exists.
const touchCaptureFunction = (event: TouchEvent) => {
    const touch = event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : event.touches[0];
    // Track the position of the touch as it moves.
    Touch.position.x = touch.clientX;
    Touch.position.y = touch.clientY;

    // Notify the touch capture of the touch movement and touchend if one is signed up.
    if (touchCapture && touchCapture.callback) {
        touchCapture.callback(event);

        if (event.type === "touchend") {
            Touch.releaseCapture(touchCapture.callback);
        }
    }
};

/**
 * Currently only basic touch support - assumes a single touch
 * throughout the touch operation.
 */
export const Touch = {
    position: {
        x: 0,
        y: 0
    },
    releaseCapture: function releaseCapture(callback: (event: TouchEvent) => void) {
        if (touchCapture && touchCapture.callback === callback) {
            touchCapture = undefined;
        }
    },

    setCapture: function setCapture(callback: (event: TouchEvent) => void) {
        // Before starting a new capture, we will release the current capture.
        if (touchCapture) {
            Touch.releaseCapture(touchCapture.callback);
        }

        // Update the touchCapture to the new capture.
        touchCapture = { callback };
    }
};

document.addEventListener("touchmove", touchCaptureFunction);
document.addEventListener("touchend", touchCaptureFunction);
document.addEventListener("touchstart", () => setFocusVisible(false), true);

/**
 * Returns the coordinates of a native event. For mouse / touch events, uses the
 * Mouse/Touch helpers. For a keyboard event, will return undefined.
 * @param event
 */
export function getPointByEventType(event: KeyboardEvent | MouseEvent | TouchEvent): IPoint | undefined {
    if ((event as TouchEvent).changedTouches || (event as TouchEvent).touches) {
        // If the event has a changedTouches or touches property, it is a touch event.
        return { x: Touch.position.x, y: Touch.position.y };
    } else if ((event as MouseEvent).clientX !== undefined) {
        // If the event has a clientX, it is not a keyboard event, so treat it as a mouse event.
        return { x: Mouse.position.x, y: Mouse.position.y };
    }
    return undefined;
}

/**
 * Checks two arrays to see they contain equal elements in the same order.
 *
 * @param array1 First array to check.
 * @param array2 Second array to check.
 * @param comparer Optional comparer to check whether array items are equal. If not specified, items are compared using strict equals.
 * @returns {boolean}
 */
export function arrayEquals<T>(array1: T[], array2: T[], comparer: (item1: T, item2: T) => boolean = (item1, item2) => item1 === item2): boolean {
    if (!array1 && !array2) {
        return true;
    }

    if (!array1 || !array2) {
        return false;
    }

    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        if (!comparer(array1[i], array2[i])) {
            return false;
        }
    }

    return true;
}
