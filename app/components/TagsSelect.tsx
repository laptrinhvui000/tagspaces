/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// import { getAllTags } from '-/reducers/taglibrary';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import { TS } from '-/tagspaces.namespace';
import TagContainer from '-/components/TagContainer';
import { getUuid } from '-/services/utils-io';
import { getAllTags } from '-/services/taglibrary-utils';

const styles: any = (theme: any) => ({
  root: {
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto'
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2)
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    fontSize: 16
  },
  paper: {
    position: 'absolute',
    zIndex: 2,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  }
});

interface Props {
  dataTid?: string;
  classes?: any;
  theme?: any;
  tags: TS.Tag[];
  label?: string;
  tagSearchType?: string;
  // defaultBackgroundColor?: string;
  // defaultTextColor?: string;
  handleChange?: (param1: any, param2: any, param3?: any) => void;
  allTags?: TS.Tag[];
  tagMode?: 'default' | 'display' | 'remove';
  isReadOnlyMode?: boolean;
  placeholderText?: string;
  selectedEntryPath?: string;
  autoFocus?: boolean;
  // removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
}

function TagsSelect(props: Props) {
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [selectedTag, setSelectedTag] = useState(undefined);
  const [allTags, setAllTags] = useState(getAllTags());

  /*const allTags = useSelector(getAllTags); */
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const {
    classes,
    placeholderText = '',
    label,
    selectedEntryPath,
    autoFocus = false,
    tags = [],
    tagMode,
    isReadOnlyMode
  } = props;

  function handleTagChange(
    event: Object,
    selectedTags: Array<TS.Tag>,
    reason: string
  ) {
    if (reason === 'selectOption') {
      props.handleChange(props.tagSearchType, selectedTags, reason);
    } else if (reason === 'createOption') {
      if (selectedTags && selectedTags.length) {
        const tagsInput = '' + selectedTags[selectedTags.length - 1];
        let tags = tagsInput
          .split(' ')
          .join(',')
          .split(','); // handle spaces around commas
        tags = [...new Set(tags)]; // remove duplicates
        tags = tags.filter(tag => tag && tag.length > 0); // zero length tags

        const newTags = [];
        tags.map(tag => {
          const newTag: TS.Tag = {
            id: getUuid(),
            title: '' + tag,
            color: defaultBackgroundColor,
            textcolor: defaultTextColor
          };
          if (isValidNewOption(newTag.title, selectedTags)) {
            newTags.push(newTag);
            allTags.push(newTag);
          }
        });
        selectedTags.pop();
        const allNewTags = [...selectedTags, ...newTags];
        props.handleChange(props.tagSearchType, allNewTags, reason);
      }
    } else if (reason === 'remove-value') {
      props.handleChange(props.tagSearchType, selectedTags, reason);
    } else if (reason === 'clear') {
      props.handleChange(props.tagSearchType, [], reason);
    }
  }

  function isValidNewOption(inputValue, selectOptions) {
    const trimmedInput = inputValue.trim();
    return (
      trimmedInput.trim().length > 0 &&
      !trimmedInput.includes(' ') &&
      !trimmedInput.includes('#') &&
      !trimmedInput.includes(',') &&
      !selectOptions.find(option => option.title === inputValue)
    );
  }

  const handleTagMenu = (event: React.ChangeEvent<HTMLInputElement>, tag) => {
    setTagMenuAnchorEl(event.currentTarget);
    setSelectedTag(tag);
  };

  const handleRemoveTag = (event, cTag: Array<TS.Tag>) => {
    /* const reducedTags = [...tags];
      for (let i = 0; i < reducedTags.length; i += 1) {
        if (reducedTags[i].title === cTag.title) {
          reducedTags.splice(i, 1);
        }
      } */
    if (cTag.length > 0) {
      handleTagChange(event, cTag, 'remove-value');
    }
  };

  const handleCloseTagMenu = () => {
    setTagMenuAnchorEl(null);
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        data-tid={props.dataTid}
        multiple
        options={!props.isReadOnlyMode ? allTags : []}
        getOptionLabel={(option: TS.Tag) => option.title}
        freeSolo
        autoSelect
        autoComplete
        disableClearable
        value={tags}
        onChange={handleTagChange}
        renderTags={(value: readonly TS.Tag[], getTagProps) =>
          value.map((option: TS.Tag, index: number) => (
            <TagContainer
              key={selectedEntryPath + option + index}
              isReadOnlyMode={isReadOnlyMode}
              tag={option}
              tagMode={tagMode}
              handleTagMenu={handleTagMenu}
              handleRemoveTag={handleRemoveTag}
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            // variant="filled"
            label={label}
            placeholder={placeholderText}
            margin="normal"
            autoFocus={autoFocus}
            style={{ marginTop: 0, marginBottom: 0, whiteSpace: 'nowrap' }}
            fullWidth
          />
        )}
      />
      {selectedEntryPath && (
        <EntryTagMenu
          anchorEl={tagMenuAnchorEl}
          open={Boolean(tagMenuAnchorEl)}
          onClose={handleCloseTagMenu}
          selectedTag={selectedTag}
          currentEntryPath={selectedEntryPath}
          removeTags={handleRemoveTag}
          isReadOnlyMode={props.isReadOnlyMode}
        />
      )}
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(TagsSelect);
