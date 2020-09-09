import { BackgroundColorClassNames, ColorClassNames } from "../styles/ColorClassNames";
import { FlexClassNames, FontClassNames, LayoutClassNames } from "../styles/CoreClassNames";
import { getSpacingClassName, getSpacingContainerClassName } from "../styles/Spacing";
import * as React from "react";
import { css } from "../styles/Util";
import { formStyles } from "../styles/Styling";
import { CssClassNames } from "../styles/CssClassNames";
import Tenants from "./Tenants";
import { saveMapping } from "../service/mappingService";
import { Component } from "react";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";

class MappingModalInternal {
    static installationId: string = '';
    static tenantId = '';
    static subscriptionId = '';
    public static getData() {
        return {
            "installationId": this.installationId,
            "tenantId": this.tenantId,
            "subscriptionId": this.subscriptionId
        }
    }
    public static setInstallationId(installationId: any) {
        this.installationId = installationId
    }
    public static setTenantId(tenantId: any) {
        this.tenantId = tenantId
    }
    public static setSubscriptionId(subscriptionId: any) {
        this.subscriptionId = subscriptionId
    }
    public static getStyles() {
        return {
            background: css(
                CssClassNames.flex.auto,
                FlexClassNames.flexColumn,
                LayoutClassNames.overflowAuto,
                FlexClassNames.justifyContentCenter,
                CssClassNames.background.repeat.noRepeat,
                CssClassNames.background.position.leftBottom,
                BackgroundColorClassNames.neutral2),
            outer: css(
                CssClassNames.flexShrink1,
                LayoutClassNames.overflowYAuto,
                getSpacingClassName("padding", "all", 8)),
            inner: css(
                "aex-acquisition-core-acquisition-modal-inner",
                BackgroundColorClassNames.default),
            brandingContainer: css(
                getSpacingContainerClassName("x", 8),
                FlexClassNames.flexRow,
                FlexClassNames.alignItemsCenter),
            brandingIcon: css(
                FontClassNames.fontSizeLl,
                ColorClassNames.communicationForeground),
            brandingText: css(
                FontClassNames.fontWeightSemiBold,
                FontClassNames.fontSizeM),
            introText: css(
                getSpacingClassName("margin", "top", 16),
                getSpacingClassName("margin", "bottom", 20),
                FontClassNames.fontSizeLl,
                FontClassNames.fontWeightSemiBold),
        };
    }
}

interface MapingState {
    success: any,
    error: any
  }

export class MappingModal extends Component<any, MapingState> {
    constructor(props: any) {
        super(props);
        MappingModalInternal.setInstallationId(props.installationId);
        this.state = {
            success: {},
            error : {}
        };
    }
    clearState() {
        this.setState({
            success: {},
            error : {}
        });
    }
    saveInstallationMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionId: string; }) {
        this.clearState();
        if (mappingInputs.installationId && mappingInputs.tenantId && mappingInputs.subscriptionId) {
            saveMapping(mappingInputs).then(result => {
                this.setState({
                    success: {
                        message: "Successfully saved"
                    }
                })
            }).catch(ex => {
                this.setState({
                    error: {
                        message: ex.message
                    }
                })
            });
        }
        else {
            this.setState({
                error: {
                    message: "Installation, Tenant and Subscription required."
                }
            });
        }
    }
    render() {
        const styles = MappingModalInternal.getStyles();
        const backgourndImageUrl = `url("devops_log_in.BOhSu5kTfWwcDDxg.svg")`;
        let propsToPass = {...this.props,
            setTenantId:MappingModalInternal.setTenantId.bind(MappingModalInternal),
            setSubscriptionId:MappingModalInternal.setSubscriptionId.bind(MappingModalInternal),
            clearState: this.clearState.bind(this)    
        };
        return (
            <div className="full-size">
                <div className="flex-grow v-scroll-auto h-scroll-auto flex flex-column region-content" data-renderedregion="content" role="main">
                    <div
                        className={styles.background}
                        style={backgourndImageUrl ? {
                            backgroundImage: backgourndImageUrl,
                        } : undefined}
                    >
                        <div className={styles.outer}>
                            <div className={styles.inner}>
                                <div className={styles.brandingContainer}>
                                    <img src="Azure-logo.png" height="20%" width="20%" alt="Azure logo" />
                                    <span className={styles.brandingText}>Microsoft Azure</span>
                                </div>
                                <MappingModalTitle>
                                    Setup your Azure info for Bandhan
                            </MappingModalTitle>
                            {this.state.error.message && <ErrorMessage message={this.state.error.message} />}
                            {this.state.success.message && <SuccessMessage message={this.state.success.message} />}
                                <form
                                    className={formStyles.standardSpacingContainer}
                                    onSubmit={(ev) => {
                                        ev.preventDefault();
                                        this.saveInstallationMapping(MappingModalInternal.getData());
                                    }}
                                >
                                    <Tenants {...propsToPass} />
                                    <div className="fontSize">
                                        Choosing <span className="fontWeightHeavy">Continue</span>
                            means that you agree to our <a className="terms-of-service-link bolt-link" href="https://go.microsoft.com/fwlink/?LinkID=266231" rel="noopener noreferrer" target="_blank">Terms of Service</a>, <a className="privacy-statement-link bolt-link" href="https://go.microsoft.com/fwlink/?LinkID=264782" rel="noopener noreferrer" target="_blank">Privacy Statement</a>, and <a className="code-of-conduct-link bolt-link" href="https://aka.ms/vstscodeofconduct" rel="noopener noreferrer" target="_blank">Code of Conduct</a>.</div>
                                    <div className="text-right">
                                        <button aria-disabled="false" className="continue-button bolt-button enabled primary bolt-focus-treatment" data-focuszone="" data-is-focusable="true" type="submit">
                                            <span className="bolt-button-text body-m">Save</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export class MappingModalTitle extends React.Component {
    public render() {
        const styles = MappingModalInternal.getStyles();

        return (
            <div className={styles.introText}>
                {this.props.children}
            </div>
        );
    }
}

export class MappingModalActions extends React.Component {
    public render() {

        return (
            <div className={formStyles.actionsContainer}>
                {this.props.children}
            </div>
        );
    }
}
