// @flow

import React, { PureComponent } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AnimatedDND from './src/components/AnimatedDND';
import type { ItemObject, ItemComponentProps } from './src/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  header: {
    marginHorizontal: 20,
    marginVertical: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Avenir',
    fontSize: 16,
    textAlign: 'center',
  },
});

const ITEMS: ItemObject[] = [
  { key: '#love' },
  { key: '#instagood' },
  { key: '#photooftheday' },
  { key: '#beautiful' },
  { key: '#fashion' },
  { key: '#happy' },
  { key: '#tbt' },
  { key: '#cute' },
  { key: '#followme' },
  { key: '#like4like' },
  { key: '#friends' },
];

class ExampleItem extends React.Component<ItemComponentProps> {
  render() {
    const { item: { isBeingDragged, key } } = this.props;
    const style = isBeingDragged && { backgroundColor: 'red' };
    return (
      <View style={style}>
        <Text>{key}</Text>
      </View>
    );
  }
}

type Props = {};
export default class Main extends PureComponent<Props> {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />

        <View style={styles.header}>
          <Text style={[styles.text, styles.title]}>
            Let's drag and drop some items!
          </Text>
          <Text style={styles.text}>
            Drag and drop items to reorder, tap to remove or press Add New to add new tags.
          </Text>
        </View>

        <AnimatedDND
          items={ITEMS}
          onPressAddNewItem={() => {}}
          ItemElement={ExampleItem} // do nothing for now
        />
      </View>
    );
  }
}
