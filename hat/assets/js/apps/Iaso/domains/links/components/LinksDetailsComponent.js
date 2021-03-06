import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import CheckBox from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import grey from '@material-ui/core/colors/grey';

import {
    withStyles,
    Container,
    Grid,
    Divider,
    Button,
} from '@material-ui/core';

import PropTypes from 'prop-types';

import LoadingSpinner from '../../../components/LoadingSpinnerComponent';
import LinksCompare from './LinksCompareComponent';

import commonStyles from '../../../styles/common';

import { fetchLinkDetail } from '../../../utils/requests';

import MESSAGES from '../messages';

const styles = theme => ({
    ...commonStyles(theme),
    root: {
        cursor: 'default',
        paddingBottom: theme.spacing(4),
        paddingTop: theme.spacing(4),
        backgroundColor: grey['100'],
    },
});

class LinksDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            link: undefined,
            loading: false,
        };
    }

    componentWillMount() {
        this.fetchDetail();
    }

    fetchDetail() {
        const { dispatch, linkId } = this.props;
        this.setState({
            loading: true,
        });
        fetchLinkDetail(dispatch, linkId)
            .then(linkDetail => {
                this.setState({
                    link: linkDetail,
                    loading: false,
                });
            })
            .catch(() => {
                this.setState({
                    loading: false,
                });
            });
    }

    render() {
        const {
            intl: { formatMessage },
            classes,
            validateLink,
            validated,
        } = this.props;
        const { link, loading } = this.state;
        return (
            <Fragment>
                <Divider />
                <Container maxWidth={false} className={classes.root}>
                    {loading && (
                        <LoadingSpinner
                            message={formatMessage(MESSAGES.loading)}
                        />
                    )}
                    {link && (
                        <Fragment>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <LinksCompare
                                        validated={validated}
                                        title={formatMessage(
                                            MESSAGES.destination,
                                        )}
                                        link={link.destination}
                                        compareLink={link.source}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <LinksCompare
                                        validated={validated}
                                        title={formatMessage(MESSAGES.origin)}
                                        link={link.source}
                                        compareLink={link.destination}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} justify="center">
                                <Button
                                    className={classes.marginTop}
                                    variant="contained"
                                    color={validated ? 'primary' : 'secondary'}
                                    onClick={() => validateLink()}
                                >
                                    {validated && (
                                        <Fragment>
                                            <CheckBox
                                                className={classes.buttonIcon}
                                            />
                                            <FormattedMessage
                                                {...MESSAGES.validated}
                                            />
                                        </Fragment>
                                    )}
                                    {!validated && (
                                        <Fragment>
                                            <CheckBoxOutlineBlank
                                                className={classes.buttonIcon}
                                            />
                                            <FormattedMessage
                                                {...MESSAGES.notValidated}
                                            />
                                        </Fragment>
                                    )}
                                </Button>
                            </Grid>
                        </Fragment>
                    )}
                </Container>
            </Fragment>
        );
    }
}

LinksDetails.defaultProps = {
    validated: false,
};

LinksDetails.propTypes = {
    classes: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    linkId: PropTypes.number.isRequired,
    validateLink: PropTypes.func.isRequired,
    validated: PropTypes.bool,
};

const MapStateToProps = state => ({
    load: state.load,
});

const MapDispatchToProps = dispatch => ({
    dispatch,
});

const LinksDetailsWithIntl = injectIntl(LinksDetails);

export default withStyles(styles)(
    connect(MapStateToProps, MapDispatchToProps)(LinksDetailsWithIntl),
);
