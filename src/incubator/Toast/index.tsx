import _ from 'lodash';
import React, {ElementRef} from 'react';
import {AccessibilityInfo, findNodeHandle, StyleSheet, Animated, Easing, StyleProp, ViewStyle, ImageSourcePropType} from 'react-native';
import {Colors, Spacings, Typography, BorderRadiuses, Shadows} from '../../style';
import Constants from '../../helpers/Constants';
import {PureBaseComponent} from '../../commons';
import View from '../../components/view';
import Button, {ButtonProps} from '../../components/button';
import Text from '../../components/text';
import Image from '../../components/image';
// import {triggerHaptic, HapticMethods} from '../../services/HapticService';
// import Loader from '../Loader';
// import withConnectionState, {WithConnectionStateProps} from '../WithConnectionState';
// import TabletView from '../TabletView';

// Create animated view base on uilib view for the safeArea support
const AnimatedView = Animated.createAnimatedComponent(View);
enum Preset {
  GENERAL = 'general',
  SUCCESS = 'success',
  FAILURE = 'failure'
}
const exclamationFill = require('./assets/exclamationFill.png');
const checkmarkFlat = require('./assets/checkmarkFlat.png');
const info = require('./assets/info.png');

export interface ToastProps {
  /**
   * Whether to show or hide the toast
   */
  visible?: boolean;
  /**
   * The position of the toast. 'top' or 'bottom'.
   */
  position?: 'top' | 'bottom';
  /**
   * the toast message
   */
  message?: string;
  /**
   * should message be centered in the toast
   */
  centerMessage?: boolean;
  /**
   * custom zIndex for toast
   */
  zIndex?: number;
  /**
   * Custom elevation for Android
   */
  elevation?: number;
  // TODO: deprecate this (user will only pass text to be rendered inside a touchable opacity)
  /**
   * a single action for the user (loader will override this)
   */
  action?: ButtonProps;
  /**
   * should show a loader
   */
  showLoader?: boolean;
  /**
   * callback for dismiss action
   */
  onDismiss?: () => void;
  /**
   * number of milliseconds to automatically invoke the onDismiss callback
   */
  autoDismiss?: number;
  /**
   * callback for end of component animation
   */
  onAnimationEnd?: (visible?: boolean) => void;
  /**
   * render a custom view that will appear permanently above or below a Toast,
   * depends on the Toast's position, and animate with it when the Toast is made visible or dismissed
   */
  renderAttachment?: () => JSX.Element;
  /**
   * render a custom loader component instead of the default when passing showLoader
   */
  customLoader: () => JSX.Element;
  /**
   * The preset look for GENERAL, SUCCESS and FAILURE (Toast.presets.xxx)
   */
  preset?: Preset;
  /**
   * Test Id for component
   */
  testID?: string;
  /**
   * Style
   */
  style?: StyleProp<ViewStyle>
  /**
   * a left icon
   */
  icon?: ImageSourcePropType;
  // TODO: props for public
  /**
   * The background color of the toast
   */
  // backgroundColor: string;
  /**
   * the toast content color (message, actions labels)
   */
  // color: string;
}

type Props = ToastProps/*  & WithConnectionStateProps */;

interface State {
  toastHeight: number;
  isAnimating: boolean;
}

/**
 * @description: A toast component
 * @example: https://github.com/wix-private/wix-react-native-ui-lib/blob/master/example/screens/components/ToastsScreen.js
 * @guidelines: https://zpl.io/VDqq4Rr
 */
class Toast extends PureBaseComponent<Props, State> {
  static displayName = 'Toast';

  static defaultProps: Partial<Props> = {
    zIndex: 100
  };

  static presets = Preset;

  toastAnimatedValue: Animated.Value;
  timer: number;
  viewRef: ElementRef<typeof Text>;

  constructor(props: Props) {
    super(props);

    this.state = {
      toastHeight: 0,
      isAnimating: false
    };

    this.toastAnimatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    const {visible} = this.props;
    if (visible) {
      this.toggleToast(visible, {delay: 100});
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentDidUpdate(prevProps) {
    const {visible} = this.props;
    if (visible !== prevProps.visible) {
      if (!this.props.visible) {
        this.clearTimer();
      }

      this.toggleToast(this.props.visible);
    }
  }

  clearTimer = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  };

  playAccessibilityFeatures() {
    const {visible, message, action} = this.props;

    if (visible) {
      if (this.viewRef && action) {
        const reactTag = findNodeHandle(this.viewRef);
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      } else if (message) {
        _.invoke(AccessibilityInfo, 'announceForAccessibility', this.getMessage());
      }
    }
  }

  setAnimationStatus = isAnimating => this.setState({isAnimating});

  toggleToast(show: boolean = false, {delay}: {delay?: number} = {}) {
    const {preset} = this.props;

    Animated.timing(this.toastAnimatedValue, {
      toValue: Number(show),
      duration: 300,
      delay,
      easing: Easing.bezier(0.215, 0.61, 0.355, 1),
      useNativeDriver: true
    }).start(this.onAnimationEnd);

    if (preset === Toast.presets.FAILURE && show) {
      // triggerHaptic(HapticMethods.impactMedium);
    }

    this.setAnimationStatus(true);
  }

  onAnimationEnd = () => {
    const {visible} = this.props;
    if (visible) {
      this.setDismissTimer();
    } else {
      this.setAnimationStatus(false);
    }

    this.playAccessibilityFeatures();
    _.invoke(this.props, 'onAnimationEnd', visible);
  };

  setDismissTimer() {
    const {autoDismiss, onDismiss} = this.props;
    if (autoDismiss && onDismiss) {
      this.timer = setTimeout(this.onDismiss, autoDismiss);
    }
  }

  onDismiss = () => {
    this.clearTimer();
    _.invoke(this.props, 'onDismiss');
  };

  getAbsolutePositionStyle = (location: 'top' | 'bottom'): {position: 'absolute', left: 0, right: 0, top?: 0, bottom?: 0} => {
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      [location]: 0
    };
  };

  onLayout = event => {
    const height = event.nativeEvent.layout.height;
    const {toastHeight} = this.state;
    if (height !== toastHeight) {
      this.setState({toastHeight: height});
    }
  };

  getIconColor = () => {
    const {preset, icon} = this.getThemeProps();
    if (icon) {
      return;
    }
    if (preset) {
      switch (preset) {
        case Toast.presets.SUCCESS:
          return Colors.green40;
        case Toast.presets.FAILURE:
          return Colors.red40;
        case Toast.presets.GENERAL:
        default:
          return Colors.getColorTint(Colors.primary, 50);
      }
    } else {
      return Colors.getColorTint(Colors.primary, 50);
    }
  };

  getIcon = () => {
    const {preset, /* isConnected,  */icon} = this.props;
    if (icon) {
      return icon;
    }
    if (preset) {
      switch (preset) {
        case Toast.presets.SUCCESS:
          return checkmarkFlat;
        case Toast.presets.FAILURE:
          return /* isConnected ?  */exclamationFill/*  : redCloud */;
        case Toast.presets.GENERAL:
        default:
          return info;
      }
    }

    return info;
  };

  renderIcon = () => {
    const tintColor = this.getIconColor();
    const icon = this.getIcon();

    return <Image source={icon} resizeMode={'contain'} style={styles.icon} tintColor={tintColor}/>;
  };

  getMessage = () => {
    const {message, preset} = this.props;
    let presetText = '';
    if (preset) {
      switch (preset) {
        case Toast.presets.SUCCESS:
          presetText = 'Success';
          break;
        case Toast.presets.FAILURE:
          presetText = 'Alert';
          break;
        default:
          break;
      }
    }

    return `${presetText} notification, ${message}`;
  };

  renderMessage = () => {
    const {message, centerMessage, testID} = this.props;
    const textAlign = centerMessage ? 'center' : 'left';
    return (
      <View accessible={Constants.isIOS} style={styles.messageContainer}>
        <Text
          testID={`${testID}-message`}
          ref={r => (this.viewRef = r)}
          style={[styles.message, {textAlign}]}
          accessibilityLabel={this.getMessage()}
        >
          {message}
        </Text>
      </View>
    );
  };

  renderRightElement = () => {
    const {showLoader, action, testID, customLoader} = this.props;

    // NOTE: order does matter
    if (showLoader) {
      if (customLoader) {
        return (
          <View center marginR-20>
            {customLoader()}
          </View>
        );
      }
      return <View style={{height: 20, width: 20, backgroundColor: 'red'}}/>;
    }

    if (action) {
      return (
        <Button
          link
          style={styles.action}
          color={Colors.grey20}
          {...action}
          labelStyle={Typography.bodySmallBold}
          accessibilityRole={'button'}
          activeBackgroundColor={Colors.grey70}
          testID={`${testID}-action`}
        />
      );
    }
  };

  renderToastContent = () => {
    const {children} = this.getThemeProps();

    if (!_.isUndefined(children)) {
      return children;
    }

    return (
      <View style={styles.toastContent}>
        {this.renderIcon()}
        {this.renderMessage()}
        {this.renderRightElement()}
      </View>
    );
  };

  renderAttachmentContent = () => {
    const {renderAttachment} = this.props;
    if (renderAttachment) {
      return <View pointerEvents={'box-none'}>{renderAttachment()}</View>;
    }
  };

  renderAttachment = (positionStyle, zIndex) => {
    return (
      <View style={[positionStyle, {zIndex}]} pointerEvents={'box-none'}>
        {this.renderAttachmentContent()}
      </View>
    );
  };

  render() {
    const {toastHeight, isAnimating} = this.state;
    const {renderAttachment} = this.props;
    const {visible, position = 'bottom', zIndex, elevation, style, testID} = this.getThemeProps();
    const positionStyle = this.getAbsolutePositionStyle(position);

    if (!visible && !isAnimating) {
      return renderAttachment ? this.renderAttachment(positionStyle, zIndex) : null;
    }

    const isTop = position === 'top';
    const positionMultiplier = isTop ? -1 : 1;
    const translateY = this.toastAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [positionMultiplier * (toastHeight || 500), 0]
    }) as any as number;
    const opacity = this.toastAnimatedValue.interpolate({
      inputRange: [0, 0.01, 1],
      outputRange: [0, 1, 1]
    });

    return (
      //TabletView
      <View
        animated
        testID={testID}
        style={[positionStyle, {zIndex, elevation, transform: [{translateY}]}]}
        pointerEvents={'box-none'}
      >
        {!isTop && !!toastHeight && this.renderAttachmentContent()}
        <AnimatedView
          useSafeArea
          style={[{opacity}, style]}
          onLayout={this.onLayout}
          pointerEvents={visible ? 'box-none' : 'none'}
        >
          {this.renderToastContent()}
        </AnimatedView>
        {isTop && !!toastHeight && this.renderAttachmentContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  toastContent: {
    backgroundColor: Colors.white,
    minHeight: 48,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: BorderRadiuses.br40,
    ...Shadows.sh20.bottom,
    marginHorizontal: Spacings.s5,
    marginVertical: Spacings.s3,
    paddingLeft: Spacings.s3
  },
  messageContainer: {
    flex: /* Constants.isTablet ? undefined :  */1,
    paddingVertical: Spacings.s3,
    justifyContent: 'center'
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.dark10,
    marginLeft: Spacings.s2,
    marginRight: Spacings.s5
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: Spacings.s1
  },
  loader: {
    marginRight: Spacings.s3
  },
  action: {
    backgroundColor: Colors.grey80,
    borderTopRightRadius: BorderRadiuses.br40,
    borderBottomRightRadius: BorderRadiuses.br40,
    paddingHorizontal: Spacings.s3,
    height: '100%'
  }
});

// export default withConnectionState<ToastProps, {presets: typeof Preset}>(Toast);
export default Toast;
