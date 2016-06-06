
/**
 * Application for manipulating a set of wireless LIFX lights.
 *
 * Each light can have its various properties changed, such as color, intensity,
 * etc. Lights can be turned on and off.
 */
var LightApp = React.createClass({

    // State management

    getInitialState: function () {
        return {
            lights: null,
            selectedID: null,
        };
    },

    /**
     * Load initial data.
     */
    componentDidMount: function () {
        var self = this;
        var success = function (lights) {
            var newLights = {};
            lights.forEach(function(item) {
                newLights[item.id] = item;
            });

            // Do we still have the currently selected light?
            var selectedID = self.state.selectedID;
            if (!selectedID in newLights) {
                selectedID = null;
            }
            self.setState({
                lights: newLights,
                selectedID: selectedID,
            });
        };
        this.props.backend.listLights("all", {success: success});
        // TODO We could in theory repeat this ever ten seconds or so, to
        //      ensure that we're in sync with other clients changing the data.
        //      A bit tricky with regard to ongoing user input.
        //      Alternatively, if the server sends sensible cache headers, we
        //      could store the time we changed something, and do HEAD requests
        //      to see if the state changed in between.
    },

    // Action handlers

    /**
     * A different light was selected in the LightList.
     */
    handleLightSelect: function (id) {
        var lights = this.state.lights;
        if (!id in lights) {
            return;  // TODO
        }

        this.setState({
            lights: lights,
            selectedID: id 
        });
    },

    /**
     * Power for a light was toggled.
     */
    handlePowerToggle: function(id) {
        var lights = this.state.lights;

        var self = this;
        var success = function (response) {
            if (!id in lights) {
                return;  // TODO
            }
            var light = lights[id];

            // Update local state following the server-side change.
            // We could instead re-request all the light data here.
            light.power = light.power == "on" ? "off" : "on";
            lights[id] = light

            self.setState({
                lights: lights,
                selectedID: self.state.selectedID
            });
        }
        this.props.backend.togglePower("id:" + id, {success: success});
    },

    /**
     * The state of a light was changed.
     */
    handleLightChange: function (id, newState) {
        var lights = this.state.lights;

        var self = this;
        var success = function(response) {
            if (!id in lights) {
                return;  // TODO
            }
            var light = lights[id];

            // Update local state following the server-side change.
            // We could instead re-request all the light data here.
            for (var field in newState) {
                if (field in light) {
                    light[field] = newState[field];
                }
            }

            self.setState({
                lights: lights,
                selectedID: self.state.selectedID
            });
        }
        this.props.backend.setState("id:" + id, newState, {success: success});
    },

    // Rendering

    /**
     * Render the component and its children.
     *
     * No lights may have been retrieved from the backend, or no lights may
     * have been selected yet, meaning some components may not be shown.
     */
    render: function () {

        var lights = this.state.lights;

        if (!lights) {
            return (<p>Loading lights...</p>);
        }

        // Prepare the control for an individual light, if one is selected.
        var selectedLight = lights[this.state.selectedID];
 
        var lightControl = null;
        if (selectedLight) {
            lightControl = (
                <LightControl
                    light={ selectedLight }
                    onLightChange={ this.handleLightChange }
                    onPowerToggle={ this.handlePowerToggle }
                />
            ); 
        }

        return (
            <div id="app">
              <LightList
                    lights={ lights }
                    selectedLight={ selectedLight }
                    onLightSelect={ this.handleLightSelect }
              />
              { lightControl }
            </div>
        );
    }
})

/**
 * Component for displaying and selecting a light from a list.
 *
 * TODO Could do all kinds of interestings things here, such as sorting by
 *      location relative to the app, if the resolution is great enough,
 *      remembering the last used light, select multiple, etc.
 */
var LightList = React.createClass({

    handleLightSelect: function (e) {
        this.props.onLightSelect(e.target.value);
    },

    render: function () {
        var lights = this.props.lights;
        var selectedLight = this.props.selectedLight;
        var selected = selectedLight ? selectedLight.id : ""; 

        var lightOptions = Object.keys(lights).map(function(key) {
            return (
                <option value={ key }>{ lights[key].label }</option>
            );
        })
        return (
            <div id="lightList">
            <label for="lightSelector">Choose light:</label><br/>
            <select id="lightSelector"
                value={ selected }
                onChange={ this.handleLightSelect }>
                <option value="" disabled="disabled">... Choose one...</option>
                { lightOptions }
            </select>
            </div>
        );
    }
})


/**
 * Parent component for displaying and controlling a single light.
 */
var LightControl = React.createClass({

    handlePowerToggle: function (e) {
        this.props.onPowerToggle(this.props.light.id);
    },

    handleLightChange: function (e) {
        this.props.onLightChange(this.props.light.id, {color: e.target.value});
    },
 
    render: function () {
        var light = this.props.light;

        return (
          <div id={ "light-" + light.id } className="lightControl">
            <BulbBox light={ light }
                onPowerToggle={ this.handlePowerToggle }
            />
            <ColorControl
                color={ this.props.light.color }
                onLightChange={ this.handleLightChange }
            />
          </div>
        );
    }
});


/**
 * Component for displaying the state of a single light.
 *
 * TODO Would be cool to swipe down/up to control brightness.
 */
var BulbBox = React.createClass({

    render: function () {
        var light = this.props.light;
        var color = light.color;

        // Set the background color and similarly colored box shadow.
        var style = light.power == "off" ? {} : {
            backgroundColor: color,
            boxShadow: "0 0 20px 10px " + color
        };

        return (
            <div className={ "bulb " + light.power }
                style={ style }
                onClick={ this.props.onPowerToggle }
            ></div>
        );
    }
})


/**
 * Control for changing the color of a light.
 *
 * TODO There's a million ways this could be displayed.
 *      Should be something that's easy to use on mobile.
 *      Could also deal with a multitude of properties and not just color.
 */
var ColorControl = React.createClass({
    validColors: [
        "yellow",
        "red",
        "green",
        "blue"
    ],

    render: function () {
        var color = this.props.color;

        var colorOptions = [];
        this.validColors.forEach(function(colorItem) {
            var label = colorItem[0].toUpperCase() + colorItem.slice(1);  // Yuck!
            var colorOption = <option value={ colorItem }>{ label }</option>
            colorOptions.push(colorOption);
        });

        return (
            <div className="colorControl">
            <label for="colorSelector">Choose color:</label><br/>
            <select id="colorSelector"
                value={ color }
                onChange={ this.props.onLightChange }>
                { colorOptions }
            </select>
            </div>
        )
    }
})


ReactDOM.render(
  <LightApp
    backend={ new MemoryBackend() }
  />,
  document.getElementById("content")
);
