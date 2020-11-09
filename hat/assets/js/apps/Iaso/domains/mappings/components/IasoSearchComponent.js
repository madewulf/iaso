import React from 'react';

import TextField from '@material-ui/core/TextField';

import Autocomplete from '@material-ui/lab/Autocomplete';

import throttle from 'lodash/throttle';

const IasoSearchComponent = props => {
    const {
        resourceName,
        collectionName,
        fields,
        style,
        name,
        label,
        onChange,
        defaultValue,
        mapOptions,
    } = props;
    const [inputValue, setInputValue] = React.useState(defaultValue || '');

    const [options, setOptions] = React.useState([]);
    const [selectedOption, setSelectedOption] = React.useState([]);
    const handleChange = event => {
        setInputValue(event.target.value);
    };

    const fetchMemo = React.useMemo(
        () =>
            throttle(
                (input, callback) =>
                    fetch(
                        `/api/${resourceName}.json?search_name=${input.input}${
                            fields ? `&fields=${fields}` : ''
                        }`,
                    )
                        .then(resp => resp.json())
                        .then(f => {
                            const union = f[collectionName || resourceName];
                            const finalOptions = mapOptions
                                ? mapOptions(union)
                                : union;
                            setOptions(finalOptions);
                        }),
                200,
            ),
        [],
    );
    React.useEffect(() => {
        setInputValue(defaultValue);
    }, [setInputValue]);
    React.useEffect(() => {
        let active = true;
        if (inputValue === '') {
            setOptions([]);
            return undefined;
        }

        fetchMemo({ input: inputValue }, results => {
            if (active) {
                setOptions(results || []);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue, fetchMemo]);

    const onSearchChange = (evt, value) => {
        onChange(name, value, resourceName);
        setSelectedOption(value);
    };

    return (
        <Autocomplete
            style={style}
            getOptionLabel={option =>
                typeof option === 'string'
                    ? option
                    : option.displayName || option.name
            }
            filterOptions={x => x}
            options={options}
            onChange={onSearchChange}
            autoComplete
            includeInputInList
            freeSolo
            defaultValue={defaultValue}
            renderInput={params => (
                <TextField
                    {...params}
                    style={{ marginTop: '30px' }}
                    name={name}
                    label={label}
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    value={inputValue}
                />
            )}
            renderOption={option => (
                <span name={name}>{option.displayName || option.name}</span>
            )}
        />
    );
};
export default IasoSearchComponent;