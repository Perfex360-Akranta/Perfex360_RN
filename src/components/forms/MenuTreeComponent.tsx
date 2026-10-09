
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import MaterialIcons from '@react-native-vector-icons/material-icons';

interface MenuItem {
  menuNumber: string;
  menuCaption?: string;
  menuName?: string;
  parent?: boolean;
  expanded?: boolean;
  loading?: boolean;
  children?: MenuItem[];
}

interface TreeItemProps {
  item: MenuItem;
  level?: number;
  onPress: (item: MenuItem) => void;
}

const COLORS = {
  background: '#354858',
  row: '#405466',
  active: '#50677A',
  border: '#4B5E6D',
  text: '#F4F7F9',
  childText: '#C1CCD4',
  muted: '#91A2AF',
  green: '#35DFA8',
};

const getMenuIcon = (caption: string) => {
  const name = caption.toLowerCase();

  // if (name.includes('dashboard')) return 'home';
  // if (name.includes('common')) return 'search';
  // if (name.includes('administration')) return 'analytics';
  // if (name.includes('social')) return 'thumb-up';
  // if (name.includes('ads')) return 'campaign';
  // if (name.includes('report')) return 'assessment';
  // if (name.includes('setting')) return 'settings';
  // if (name.includes('master')) return 'folder';

  if (name.includes('dashboard')) return 'home';
  if (name.includes('master')) return 'folder';
  if (name.includes('external system')) {
    return 'settings-input-component';
  }
  if (name === 'common') return 'apps';
  if (name.includes('firm creation')) return 'business';
  if (name.includes('user release lock')) return 'lock-open';
  if (name.includes('planned maintenance')) return 'build';
  if (name.includes('jishu hozen')) return 'handyman';
  if (name.includes('kobetsu kaizen')) return 'trending-up';
  if (name.includes('quality maintenance')) return 'verified';
  if (name.includes('education') || name.includes('training')) {
    return 'school';
  }
  if (name.includes('environment') || name.includes('safety')) {
    return 'health-and-safety';
  }
  if (name.includes('office tpm')) return 'domain';
  if (name.includes('early management')) return 'schedule';
  if (name.includes('services')) return 'miscellaneous-services';
  if (name.includes('role') || name.includes('team')) {
    return 'groups';
  }
  if (name.includes('mobile transaction')) {
    return 'phone-android';
  }
  if (name.includes('administration')) return 'admin-panel-settings';
  if (name.includes('transaction')) return 'apps';
  if (name.includes('report')) return 'assessment';
  if (name.includes('setting')) return 'settings';

  return 'circle';
};

const TreeItem = ({
  item,
  level = 0,
  onPress,
}: TreeItemProps) => {
  const caption = item.menuCaption || item.menuName || '';
  const hasChildren = item.parent === true;
  const expanded = item.expanded === true;
  const isRoot = level === 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item)}
        style={[
          styles.row,
          { paddingLeft: 12 + level * 18 },
          isRoot && styles.rootRow,
          expanded && styles.activeRow,
        ]}
      >
        {expanded && (
          <View style={styles.activeIndicator} />
        )}

        <View style={styles.iconBox}>
          {isRoot ? (
            <MaterialIcons
              name={getMenuIcon(caption) as any}
              size={18}
              color={COLORS.text}
            />
          ) : (
            <View style={styles.treeDot} />
          )}
        </View>

        <Text
          style={[
            styles.title,
            !isRoot && styles.childTitle,
            expanded && styles.expandedTitle,
          ]}
          numberOfLines={2}
        >
          {caption}
        </Text>

        {item.loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.green}
          />
        ) : hasChildren ? (
          <MaterialIcons
            name={expanded ? 'expand-more' : 'chevron-right'}
            size={22}
            color={expanded ? COLORS.green : COLORS.muted}
          />
        ) : null}
      </TouchableOpacity>

      {expanded &&
        item.children &&
        item.children.length > 0 && (
          <View style={styles.childrenContainer}>
            <View style={styles.treeLine} />

            {item.children.map(child => (
              <TreeItem
                key={child.menuNumber}
                item={child}
                level={level + 1}
                onPress={onPress}
              />
            ))}
          </View>
        )}
    </View>
  );
};

export default TreeItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  row: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  rootRow: {
    backgroundColor: COLORS.row,
  },
  activeRow: {
    backgroundColor: COLORS.active,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.green,
  },
  // iconBox: {
  //   width: 23,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
   iconBox: {
     width: 28,
     alignItems: 'center',
     justifyContent: 'center',
     marginRight: 5,
  },
  treeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.green,
  },
  title: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  childTitle: {
    fontSize: 11,
    color: COLORS.childText,
    fontWeight: '400',
  },
  expandedTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  childrenContainer: {
    position: 'relative',
    paddingBottom: 4,
  },
  treeLine: {
    position: 'absolute',
    left: 29,
    top: 0,
    bottom: 8,
    width: 1,
    backgroundColor: '#526575',
  },
});
