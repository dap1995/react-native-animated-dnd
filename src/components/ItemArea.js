// @flow

import * as React from 'react';
import {
  Text,
  View,
} from 'react-native';
import ItemWrapper from './ItemWrapper';
import type { ItemComponentProps, ItemObject } from '../types';

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
  // Called when user taps 'Add new' button
  onPressAddNew: () => void,
  // Passes these two callbacks down to Item component
  onPress: (item?: {}) => void,
  onRenderItem: (
    item: ItemObject,
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

  render() {
    const {
      items,
      onPress,
      onPressAddNew,
      onRenderItem,
      ItemElement,
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
        <Text
          style={styles.add}
          onPress={onPressAddNew}
        >
          Add new
        </Text>
      </View>
    );
  }
}

