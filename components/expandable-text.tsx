import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

export default function ExpandableText({ text, maxLines = 3 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);

  const onTextLayout = (event: any) => {
    if (!expanded && event.nativeEvent.lines.length >= maxLines) {
      setShowMoreButton(true);
    }
    if (expanded) {
      setShowMoreButton(false);
    }
  };

  const toggleText = () => {
    setExpanded(!expanded);
  };

  return (
    <View>
      <Text
        style={styles.description}
        numberOfLines={expanded ? undefined : maxLines}
        onTextLayout={onTextLayout}
      >
        {text}
      </Text>
      {showMoreButton && !expanded && (
        <TouchableOpacity onPress={toggleText} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>More</Text>
          <Ionicons name="chevron-down" size={12} color="#2d5016" style={styles.moreButtonIcon} />
        </TouchableOpacity>
      )}
      {expanded && (
         <TouchableOpacity onPress={toggleText} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>Less</Text>
          <Ionicons name="chevron-up" size={12} color="#2d5016" style={styles.moreButtonIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 4,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  moreButtonText: {
    fontSize: 14,
    color: '#2d5016',
    fontWeight: '500',
  },
  moreButtonIcon: {
    marginLeft: 4,
  },
});