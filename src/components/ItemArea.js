// @flow

import * as React from 'react';
import { View } from 'react-native';
import type { NativeMethodsMixinType } from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';
import ItemWrapper from './ItemWrapper';
import type {
  ItemComponentProps,
  ItemObject,
} from '../types';

const styles = {
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
    borderWidth: 2,
    paddingBottom: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  add: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 5,
    textDecorationLine: 'underline',
  },
};

type Props = {
  items: ItemObject[],
  ItemElement: React.ComponentType<ItemComponentProps>,
  DeleteElement?: React.ComponentType<{}>,
  AddElement?: React.ComponentType<{}>,
  // Called when user taps 'Add new' button
  onPressAddNew: () => void,
  // Passes these two callbacks down to Item component
  onPress: (item: {}, items?: ItemObject[]) => void,
  onRenderItem: (
    item: ItemObject,
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ) => void,
  onRenderDelete: (
    screenX: number,
    screenY: number,
    width: number,
    height: number
  ) => void,
  style?: {},
  styleWrapper?: {},
};

export default class Area extends React.Component<Props> {
  props: Props;
  deleteView: ?NativeMethodsMixinType;

  // Pass tag coordinates up to the parent component
  onMeasure = (
    x: number,
    y: number,
    width: number,
    height: number,
    screenX: number,
    screenY: number,
  ): void => {
    this.props.onRenderDelete(screenX, screenY, width, height);
  };

  // Call view container's measure function to measure tag position on the screen
  onLayout = (): void => {
    // eslint-disable-next-line no-unused-expressions
    this.deleteView && this.deleteView.measure(this.onMeasure);
  };

  render() {
    const {
      items,
      onPress,
      onPressAddNew,
      onRenderItem,
      ItemElement,
      DeleteElement,
      AddElement = null,
      style,
      styleWrapper,
    } = this.props;

    return (
      <View style={style || styles.container}>
        {
          items.map(item =>
          <ItemWrapper
            key={item.key}
            item={item}
            onPress={onPress}
            onRender={onRenderItem}
            ItemElement={ItemElement}
            style={styleWrapper}
          />)
        }
        { AddElement && <AddElement onPress={onPressAddNew} /> }
        { DeleteElement &&
          <View
            ref={(el) => { this.deleteView = el; }}
            onLayout={this.onLayout}
          >
            <DeleteElement />
          </View>
        }
      </View>
    );
  }
}

