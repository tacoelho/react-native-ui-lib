import _ from 'lodash';
import React, {Component} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  Switch,
  RadioButton,
  RadioGroup,
  Assets,
  Colors,
  View,
  Button,
  Text,
  Banner,
  Incubator
} from 'react-native-ui-lib';
const {Toast} = Incubator;

export default class ToastsScreen extends Component {
  constructor(props) {
    super(props);

    this.actionLabel = {label: 'Undo', onPress: () => console.warn('undo')};
    this.actionIcon = {iconSource: Assets.icons.add, onPress: () => console.warn('add')};
    this.colors = [Colors.green30, Colors.red30, Colors.violet30];
    this.messages = {
      GENERAL: 'La formule Pass VIP illimité 5 mois est masquée',
      SUCCESS: 'The action completed successfully.',
      FAILURE: 'The action could not be completed.'
    };

    this.ACTIONS = {
      NONE: 'None',
      LABEL: 'Label',
      ICON: 'Icon'
    };

    this.PRESETS = {
      NONE: 'None',
      GENERAL: 'General',
      SUCCESS: 'Success',
      FAILURE: 'Failure'
    };

    this.state = {
      visible: false,
      isPositionBottom: true,
      isCustomContent: false,
      showLoader: false,
      selectedAction: this.ACTIONS.NONE,
      hasAttachment: false,
      selectedPreset: this.PRESETS.NONE
    };
  }

  togglePosition = () => {
    this.setState({
      isPositionBottom: !this.state.isPositionBottom
    });
  };

  toggleLoader = () => {
    this.setState({
      showLoader: !this.state.showLoader
    });
  };

  setAction = selectedAction => {
    this.setState({
      selectedAction
    });
  };

  toggleCustom = () => {
    this.setState({
      isCustomContent: !this.state.isCustomContent
    });
  };

  toggleAttachment = () => {
    this.setState({
      hasAttachment: !this.state.hasAttachment
    });
  };

  setPreset = selectedPreset => {
    this.setState({selectedPreset});
  };

  toggleVisibility = () => {
    this.setState({
      visible: !this.state.visible
    });
  };

  renderCustomContent = () => {
    return (
      <View flex padding-10 bg-white>
        <Text text60>This is a custom content</Text>
        <Text>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry
          standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
          make a type specimen book.
        </Text>
      </View>
    );
  };

  renderAboveToast = () => {
    return (
      <View flex bottom right paddingB-50 paddingR-20 pointerEvents={'box-none'}>
        <Button /* iconSource={Assets.icons.general.manage}  */color={Colors.white} style={{height: 50, width: 50}}/>
      </View>
    );
  };

  renderBelowToast = () => {
    return (
      <Banner
        message={'Objects may be closer than they appear'}
        actionLabel={'Noted'}
        showDismiss
        messageType={Banner.messageTypes.MAJOR}
      />
    );
  };

  renderAttachment = () => {
    const {isPositionBottom, hasAttachment} = this.state;
    if (hasAttachment) {
      if (isPositionBottom) {
        return this.renderAboveToast();
      } else {
        return this.renderBelowToast();
      }
    }
  };

  getAction = () => {
    const {selectedAction} = this.state;
    switch (selectedAction) {
      case this.ACTIONS.LABEL:
        return this.actionLabel;
      case this.ACTIONS.ICON:
        return this.actionIcon;
      case this.ACTIONS.NONE:
      default:
        return undefined;
    }
  };

  getMessage = () => {
    const {selectedPreset} = this.state;
    switch (selectedPreset) {
      case this.PRESETS.GENERAL:
      default:
        return this.messages.GENERAL;
      case this.PRESETS.FAILURE:
        return this.messages.FAILURE;
      case this.PRESETS.SUCCESS:
        return this.messages.SUCCESS;
    }
  }

  renderToast = () => {
    const {
      visible,
      isPositionBottom,
      showLoader,
      isCustomContent,
      hasAttachment,
      selectedPreset
    } = this.state;
    const position = isPositionBottom ? 'bottom' : 'top';
    const action = this.getAction();
    const preset = selectedPreset === this.PRESETS.NONE ? undefined : selectedPreset.toLowerCase();

    return (
      <Toast
        key={`${isPositionBottom}-${isCustomContent}-${hasAttachment}`}
        visible={visible}
        position={position}
        message={this.getMessage()}
        showLoader={showLoader}
        renderAttachment={this.renderAttachment}
        action={action}
        preset={preset}
      >
        {isCustomContent ? this.renderCustomContent() : undefined}
      </Toast>
    );
  };

  renderRadioButton = (key, value, hasLeftMargin) => {
    return <RadioButton testID={key} key={key} value={value} label={value} marginT-10 marginR-10={hasLeftMargin}/>;
  };

  renderRadioGroup = (title, data, initialValue, onValueChange) => {
    const radioButtons = [];
    Object.entries(data).forEach(([key, value], index) => {
      radioButtons.push(this.renderRadioButton(`${title}_${key}`, value, index !== _.size(data) - 1));
    });

    return (
      <RadioGroup marginT-20 initialValue={initialValue} onValueChange={onValueChange}>
        <Text text65>{title}:</Text>
        <View row style={{flexWrap: 'wrap'}}>
          {radioButtons}
        </View>
      </RadioGroup>
    );
  };

  renderSwitch = (testID, title, value, onValueChange, currentText) => {
    return (
      <View row centerV marginT-20>
        <Text text65L>{title}</Text>
        <Switch testID={testID} value={value} onValueChange={onValueChange} marginL-10/>
        <Text marginL-10 text65L>
          {currentText}
        </Text>
      </View>
    );
  };

  renderButton = isBottom => {
    const {isPositionBottom} = this.state;
    const shouldBeShown = isBottom !== isPositionBottom;

    if (shouldBeShown || !isBottom) {
      return (
        <Button
          key={`${isPositionBottom}`}
          testID={`uilib.showToast.${isBottom}`}
          marginT-10
          marginB-10
          label={'Toggle toast'}
          onPress={this.toggleVisibility}
          style={{opacity: shouldBeShown ? 1 : 0}}
          disabled={!shouldBeShown}
          throttleTime={0}
        />
      );
    }
  };

  render() {
    const {
      isPositionBottom,
      showLoader,
      selectedAction,
      isCustomContent,
      hasAttachment,
      selectedPreset
    } = this.state;

    return (
      <View flex paddingT-12 paddingH-12>
        <View row spread centerV>
          <Text text30 dark10>
            Toast
          </Text>
          {this.renderButton(false)}
        </View>

        <View flex style={styles.scrollViewContainer}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {this.renderSwitch(
              'positionSwitch',
              'Toast position:',
              !isPositionBottom,
              this.togglePosition,
              isPositionBottom ? 'bottom' : 'top'
            )}
            {this.renderSwitch('loaderSwitch', 'Loader:', showLoader, this.toggleLoader, showLoader ? 'Show' : 'Hide')}
            {this.renderRadioGroup('Actions', this.ACTIONS, selectedAction, this.setAction)}
            {this.renderSwitch(
              'customSwitch',
              'Custom content:',
              isCustomContent,
              this.toggleCustom,
              isCustomContent ? 'custom' : 'default'
            )}
            {this.renderSwitch(
              'attachmentSwitch',
              'Add attachment:',
              hasAttachment,
              this.toggleAttachment,
              hasAttachment ? 'with attachment' : 'default'
            )}
            {this.renderRadioGroup('Presets', this.PRESETS, selectedPreset, this.setPreset)}
          </ScrollView>
          {this.renderButton(true)}
        </View>
        {this.renderToast()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    paddingBottom: 80
  },
  color: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.grey10
  }
});
