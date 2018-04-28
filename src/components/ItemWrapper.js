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
};

type Props = {
  item: ItemObject,
  ItemElement: React.ComponentType<ItemComponentProps>,
  // Called when user taps on a tag
  onPress: (item: {}, items?: ItemObject[]) => void,
  // Called after a tag is rendered
  onRender: (
    item: ItemObject,
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ) => void,
  style?: {},
};

export default class ItemWrapper extends React.Component<Props> {
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

  render() {
    const {
      item,
      ItemElement,
      style,
      onPress,
    } = this.props;
    return (
      <View
        ref={(el) => { this.container = el; }}
        style={style || styles.container}
        onLayout={this.onLayout}
      >
        <ItemElement item={item} onPress={onPress} />
      </View>
    );
  }
}
