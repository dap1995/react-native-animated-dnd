// @flow

import * as React from 'react';
import {
  LayoutAnimation,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import ItemArea from './ItemArea';
import type { ItemComponentProps, ItemObject, GestureState } from '../types';
import { isPointWithinArea, moveArrayElement } from '../helpers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
});

type Props = {
  // Array of item keys
  items: ItemObject[],
  animationDuration: number,
  // Passes onPressAddNewItem callback down to ItemsArea component
  onPressAddNewItem: () => void,
  onPressItem: (item?: {}) => void,
  ItemElement: React.ComponentType<ItemComponentProps>,
  onChange?: (items: ItemObject[]) => void,
  style?: {},
  styleArea?: {},
  styleWrapper?: {},
};

type State = {
  items: ItemObject[],
  dndEnabled: boolean,
};

export default class AnimatedDND extends React.Component<Props, State> {
  props: Props;

  static defaultProps = {
    animationDuration: 250,
  };

  state: State = {
    items: this.props.items, // remove duplicates
    dndEnabled: true,
  };

  itemBeingDragged: ?ItemObject;

  // Animate layout changes when dragging or removing an Item
  componentDidUpdate() {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: this.props.animationDuration,
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { items } = nextProps;
    this.setState({ items });
  }

  // Enable dnd back after the animation is over
  enableDndAfterAnimating = (): void => {
    setTimeout(this.enableDnd, this.props.animationDuration);
  };

  enableDnd = (): void => {
    this.setState({ dndEnabled: true });
  };

  // Swap two items
  swapItems = (draggedItem: ItemObject, anotherItem: ItemObject): void => {
    this.setState((state: State) => {
      const draggedItemIndex = state.items.findIndex(({ key }) => key === draggedItem.key);
      const anotherItemIndex = state.items.findIndex(({ key }) => key === anotherItem.key);
      return {
        items: moveArrayElement(
          state.items, // array
          draggedItemIndex, // from
          anotherItemIndex, // to
        ),
        dndEnabled: false,
      };
    }, this.enableDndAfterAnimating);
  };

  // Find the item at given coordinates
  findItemAtCoordinates = (x: number, y: number, exceptItem?: ItemObject): ?ItemObject =>
    this.state.items.find(item =>
      item.tlX && item.tlY && item.brX && item.brY
      && isPointWithinArea(x, y, item.tlX, item.tlY, item.brX, item.brY)
      && (!exceptItem || exceptItem.key !== item.key));

  // Create PanResponder
  createPanResponder = (): PanResponder => PanResponder.create({
    // Handle drag gesture
    onMoveShouldSetPanResponder: (_, gestureState: GestureState): boolean => {
      const {
        dx,
        dy,
        moveX,
        moveY,
        numberActiveTouches,
      } = gestureState;

      // Do not set pan responder if a multi touch gesture is occurring
      if (numberActiveTouches !== 1) return false;
      // or if there was no movement since the gesture started
      if (dx === 0 && dy === 0) return false;

      // Find the item below user's finger at given coordinates
      const item = this.findItemAtCoordinates(moveX, moveY);
      if (item) {
        // assign it to `this.itemBeingDragged` while dragging
        this.itemBeingDragged = item;
        // and tell PanResponder to start handling the gesture by calling `onPanResponderMove`
        return true;
      }
      return false;
    },
    onPanResponderGrant: (): void => {
      if (!this.itemBeingDragged) return;
      this.updateItemState(this.itemBeingDragged, { isBeingDragged: true });
    },
    onPanResponderMove: (_, gestureState: GestureState): void => {
      const { moveX, moveY } = gestureState;
      // Do nothing if dnd is disabled
      if (!this.state.dndEnabled) return;
      if (!this.itemBeingDragged) return;
      // Find the item we're dragging the current item over
      const draggedOverItem = this.findItemAtCoordinates(moveX, moveY, this.itemBeingDragged);
      if (draggedOverItem) {
        if (!this.itemBeingDragged) return;
        this.swapItems(this.itemBeingDragged, draggedOverItem);
      }
    },
    onPanResponderRelease: (): void => {
      if (!this.itemBeingDragged) return;
      this.updateItemState(this.itemBeingDragged, { isBeingDragged: false });
      // return new state when dropped item
      const { onChange } = this.props;
      if (onChange) onChange(this.state.items);
      this.itemBeingDragged = undefined;
    },
    onPanResponderTerminate: (): void => {
      if (!this.itemBeingDragged) return;
      this.updateItemState(this.itemBeingDragged, { isBeingDragged: false });
      this.itemBeingDragged = undefined;
    },
  });

  panResponder: PanResponder = this.createPanResponder();

  // Remove item
  removeItem = (item: ItemObject): void => {
    this.setState((state: State) => {
      const index = state.items.findIndex(({ key }) => key === item.key);
      return {
        items: [
          // Remove the item
          ...state.items.slice(0, index),
          ...state.items.slice(index + 1),
        ],
      };
    });
  };

  // Update the item in the state with given props
  updateItemState = (item: ItemObject, props: Object): void => {
    this.setState((state: State) => {
      const index = state.items.findIndex(({ key }) => key === item.key);
      // Adding item coordinates
      return {
        items: [
          ...state.items.slice(0, index),
          {
            ...state.items[index],
            ...props,
          },
          ...state.items.slice(index + 1),
        ],
      };
    });
  };

  onRenderItem = (
    item: ItemObject,
    screenX: number,
    screenY: number,
    width: number,
    height: number,
  ): void => {
    this.updateItemState(item, {
      tlX: screenX,
      tlY: screenY,
      brX: screenX + width,
      brY: screenY + height,
    });
  };

  render() {
    const {
      ItemElement,
      style,
      styleArea,
      styleWrapper,
      onPressItem,
    } = this.props;
    const { items } = this.state;
    return (
      <View
        style={style || styles.container}
        {...this.panResponder.panHandlers}
      >
        <ItemArea
          items={items}
          onPress={onPressItem} // do nothing for now
          onRenderItem={this.onRenderItem} // do nothing for now
          onPressAddNew={this.props.onPressAddNewItem}
          ItemElement={ItemElement}
          style={styleArea}
          styleWrapper={styleWrapper}
        />
      </View>
    );
  }
}
