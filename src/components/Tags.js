// @flow

import React, { PureComponent } from 'react';
import {
  LayoutAnimation,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import TagsArea from './TagsArea';
import type { TagObject, GestureState } from '../types';
import { isPointWithinArea, moveArrayElement } from '../helpers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
});

type Props = {
  // Array of tag titles
  tags: string[],
  animationDuration: number,
  // Passes onPressAddNewTag callback down to TagsArea component
  onPressAddNewTag: () => void,
};

type State = {
  tags: TagObject[],
  dndEnabled: boolean,
};

export default class Tags extends PureComponent<Props, State> {
  props: Props;

  static defaultProps = {
    animationDuration: 250,
  };

  state: State = {
    // Convert passed array of tag titles to array of objects of TagObject type,
    // so ['tag', 'another'] becomes [{ title: 'tag' }, { title: 'another' }]
    tags: [...new Set(this.props.tags)] // remove duplicates
      .map((title: string) => ({ title })), // convert to objects
    dndEnabled: true,
  };

  tagBeingDragged: ?TagObject;

  // Animate layout changes when dragging or removing a tag
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate() {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: this.props.animationDuration,
    });
  }

  // Enable dnd back after the animation is over
  enableDndAfterAnimating = (): void => {
    setTimeout(this.enableDnd, this.props.animationDuration);
  };

  enableDnd = (): void => {
    this.setState({ dndEnabled: true });
  };

  // Swap two tags
  swapTags = (draggedTag: TagObject, anotherTag: TagObject): void => {
    this.setState((state: State) => {
      const draggedTagIndex = state.tags.findIndex(({ title }) => title === draggedTag.title);
      const anotherTagIndex = state.tags.findIndex(({ title }) => title === anotherTag.title);
      return {
        tags: moveArrayElement(
          state.tags, // array
          draggedTagIndex, // from
          anotherTagIndex, // to
        ),
        dndEnabled: false,
      };
    }, this.enableDndAfterAnimating);
  };

  // Find the tag at given coordinates
  findTagAtCoordinates = (x: number, y: number, exceptTag?: TagObject): ?TagObject => {
    return this.state.tags.find(tag =>
      tag.tlX && tag.tlY && tag.brX && tag.brY
      && isPointWithinArea(x, y, tag.tlX, tag.tlY, tag.brX, tag.brY)
      && (!exceptTag || exceptTag.title !== tag.title));
  };

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

      // Find the tag below user's finger at given coordinates
      const tag = this.findTagAtCoordinates(moveX, moveY);
      if (tag) {
        // assign it to `this.tagBeingDragged` while dragging
        this.tagBeingDragged = tag;
        // and tell PanResponder to start handling the gesture by calling `onPanResponderMove`
        return true;
      }
      return false;
    },
    onPanResponderGrant: (): void => {
      if (!this.tagBeingDragged) return;
      this.updateTagState(this.tagBeingDragged, { isBeingDragged: true });
    },
    onPanResponderMove: (_, gestureState: GestureState): void => {
      const { moveX, moveY } = gestureState;
      // Do nothing if dnd is disabled
      if (!this.state.dndEnabled) return;
      if (!this.tagBeingDragged) return;
      // Find the tag we're dragging the current tag over
      const draggedOverTag = this.findTagAtCoordinates(moveX, moveY, this.tagBeingDragged);
      if (draggedOverTag) {
        if (!this.tagBeingDragged) return;
        this.swapTags(this.tagBeingDragged, draggedOverTag);
      }
    },
    onPanResponderRelease: (): void => {
      if (!this.tagBeingDragged) return;
      this.updateTagState(this.tagBeingDragged, { isBeingDragged: false });
      this.tagBeingDragged = undefined;
    },
    onPanResponderTerminate: (): void => {
      if (!this.tagBeingDragged) return;
      this.updateTagState(this.tagBeingDragged, { isBeingDragged: false });
      this.tagBeingDragged = undefined;
    },
  });

  panResponder: PanResponder = this.createPanResponder();

  // Remove tag
  removeTag = (tag: TagObject): void => {
    this.setState((state: State) => {
      const index = state.tags.findIndex(({ title }) => title === tag.title);
      return {
        tags: [
          // Remove the tag
          ...state.tags.slice(0, index),
          ...state.tags.slice(index + 1),
        ],
      };
    });
  };

  // Update the tag in the state with given props
  updateTagState = (tag: TagObject, props: Object): void => {
    this.setState((state: State) => {
      const index = state.tags.findIndex(({ title }) => title === tag.title);
      // Adding tag coordinates
      return {
        tags: [
          ...state.tags.slice(0, index),
          {
            ...state.tags[index],
            ...props,
          },
          ...state.tags.slice(index + 1),
        ],
      };
    });
  };

  onRenderTag = (
    tag: TagObject,
    screenX: number,
    screenY: number,
    width: number,
    height: number,
  ): void => {
    this.updateTagState(tag, {
      tlX: screenX,
      tlY: screenY,
      brX: screenX + width,
      brY: screenY + height,
    });
  };

  render() {
    const { tags } = this.state;
    return (
      <View
        style={styles.container}
        {...this.panResponder.panHandlers}
      >

        <TagsArea
          tags={tags}
          onPress={this.removeTag} // do nothing for now
          onRenderTag={this.onRenderTag} // do nothing for now
          onPressAddNew={this.props.onPressAddNewTag}
        />

      </View>
    );
  }
}
