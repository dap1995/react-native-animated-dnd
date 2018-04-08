// @flow

import * as React from 'react';
import { View } from 'react-native';
import type { NativeMethodsMixinType } from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';
import type { ItemObject, ItemComponentProps } from '../types';

const styles = {
  container: {
    marginBottom: 8,
    marginRight: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, .33)',
    borderColor: 'rgba(255, 255, 255, .25)',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagBeingDragged: {
    backgroundColor: 'rgba(255, 255, 255, .01)',
    borderStyle: 'dashed',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Avenir',
    fontSize: 15,
    fontWeight: 'normal',
  },
};

type Props = {
  item: ItemObject,
  ItemElement: React.ComponentType<ItemComponentProps>,
  // Called when user taps on a tag
  onPress: (item: ItemObject) => void,
  // Called after a tag is rendered
  onRender: (
    item: ItemObject,
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ) => void,
};

export default class ItemWrapper extends React.PureComponent<Props> {
  container: ?NativeMethodsMixinType;

  // Pass tag coordinates up to the parent component
  onMeasure = (
    x: number,
    y: number,
    width: number,
    height: number,
    screenX: number,
    screenY: number,
  ): void => {
    this.props.onRender(this.props.item, screenX, screenY, width, height);
  };

  // Call view container's measure function to measure tag position on the screen
  onLayout = (): void => {
    // eslint-disable-next-line no-unused-expressions
    this.container && this.container.measure(this.onMeasure);
  };

  // Handle tag taps
  onPress = (): void => {
    this.props.onPress(this.props.item);
  };

  render() {
    const { item, ItemElement } = this.props;
    return (
      <View
        ref={(el) => { this.container = el; }}
        style={styles.container}
        onLayout={this.onLayout}
      >
        <ItemElement item={item} />
      </View>
    );
  }
}
